import 'dotenv/config';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import cors from 'cors';

admin.initializeApp();

const db = admin.firestore();

// CORS middleware
const corsHandler = cors({ origin: true });

// Configuration
const OTP_EXPIRY_MINUTES = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

// Verify required environment variables in production
if (process.env.GCLOUD_PROJECT && !process.env.TEACHER_EMAIL_USER) {
  console.warn('WARNING: TEACHER_EMAIL_USER not configured. OTP emails will not be sent. Configure in Firebase Console.');
}

// Email Configuration - Initialize as needed to pick up latest environment variables
const getEmailTransporter = (): nodemailer.Transporter | null => {
  try {
    const emailUser = process.env.TEACHER_EMAIL_USER || 'your-email@gmail.com';
    const emailPass = process.env.TEACHER_EMAIL_PASSWORD || 'your-app-password';
    
    console.log(`📧 Email Config: user=${emailUser}, password=${emailPass ? '***' + emailPass.slice(-4) : 'NOT SET'}`);
    
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      connectionTimeout: 10000,
      socketTimeout: 10000
    });
  } catch (error) {
    console.error('Email transporter initialization error:', error);
    return null;
  }
};

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.TEACHER_EMAIL_USER || 'noreply@bahasa-learning.com',
      to: email,
      subject: 'Your Bahasa Learning Platform Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #0066cc;">Bahasa Learning Platform</h2>
          <p>Your one-time login code is:</p>
          <h1 style="color: #0066cc; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
          <p><strong>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</strong></p>
          <p>If you did not request this code, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Bahasa Learning Platform - Early Literacy for Grades 1-2</p>
        </div>
      `
    };

    if (process.env.TEACHER_EMAIL_USER && process.env.TEACHER_EMAIL_PASSWORD) {
      console.log(`🔧 Creating transporter with email: ${process.env.TEACHER_EMAIL_USER}`);
      const transporter = getEmailTransporter();
      if (transporter) {
        console.log(`📧 Attempting to send email to ${email} with code ${otp}`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent successfully to ${email}`);
        return true;
      }
      console.warn('❌ Email transporter not available');
      return false;
    } else {
      console.log(`[MOCK MODE] OTP for ${email}: ${otp}`);
      console.warn('⚠️  TEACHER_EMAIL_USER or TEACHER_EMAIL_PASSWORD not set');
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

// Cloud Function: Send OTP
export const sendOTP = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { email } = req.body;
      console.log(`📬 sendOTP received request for email: ${email}`);

      if (!email || !email.includes('@')) {
        console.warn(`⚠️  Invalid email: ${email}`);
        res.status(400).json({ error: 'Valid email required' });
        return;
      }

      const otp = generateOTP();
      const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
      console.log(`🔐 Generated OTP: ${otp}, expires at ${expiryTime}`);

      // Store OTP in Firestore
      try {
        console.log(`💾 Storing OTP in Firestore for ${email}`);
        const docRef = await db.collection('teacherOTPs').add({
          email: email.toLowerCase(),
          otp: otp,
          expiryTime: admin.firestore.Timestamp.fromDate(expiryTime),
          verified: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          attempts: 0
        });
        console.log(`✅ OTP stored successfully in Firestore: ${docRef.id}`);
      } catch (dbError) {
        console.error('❌ Firestore error:', dbError);
        res.status(500).json({ error: 'Database error', details: dbError });
        return;
      }

      const emailSent = await sendOTPEmail(email, otp);

      if (emailSent) {
        console.log(`✅ sendOTP success for ${email}`);
        res.status(200).json({
          success: true,
          message: 'OTP sent to your email',
          mockMode: !process.env.TEACHER_EMAIL_USER
        });
      } else {
        console.error(`❌ Email failed to send for ${email}`);
        res.status(500).json({ error: 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      res.status(500).json({ error: 'Internal server error', details: error });
    }
  });
});

// Cloud Function: Verify OTP and return JWT-like token
export const verifyOTP = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { email, otp } = req.body;

      if (!email || !otp) {
        res.status(400).json({ error: 'Email and OTP required' });
        return;
      }

      // Query Firestore for matching OTP
      try {
        const query = await db.collection('teacherOTPs')
          .where('email', '==', email.toLowerCase())
          .where('otp', '==', otp)
          .where('verified', '==', false)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (query.empty) {
          res.status(401).json({ error: 'Invalid OTP' });
          return;
        }

        const otpDoc = query.docs[0];
        const otpData = otpDoc.data();

        // Check if OTP is expired
        const expiryTime = otpData.expiryTime.toDate();
        if (new Date() > expiryTime) {
          res.status(401).json({ error: 'OTP has expired' });
          return;
        }

        // Mark OTP as verified
        await otpDoc.ref.update({
          verified: true,
          verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create or update teacher record in 'teachers' collection
        try {
          const teacherRef = db.collection('teachers').doc(email.toLowerCase());
          const teacherDoc = await teacherRef.get();
          
          if (!teacherDoc.exists) {
            // New teacher - create record
            await teacherRef.set({
              email: email.toLowerCase(),
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              lastLogin: admin.firestore.FieldValue.serverTimestamp(),
              status: 'active'
            });
            console.log(`✅ New teacher record created for ${email}`);
          } else {
            // Existing teacher - update last login
            await teacherRef.update({
              lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Teacher login updated for ${email}`);
          }
        } catch (teacherError) {
          console.warn('Error creating/updating teacher record:', teacherError);
          // Don't fail the request if teacher record creation fails
        }

        // Create custom JWT token using Firebase Admin SDK
        const customToken = await admin.auth().createCustomToken(email.toLowerCase());

        res.status(200).json({
          success: true,
          token: customToken,
          email: email.toLowerCase(),
          message: 'Login successful'
        });
      } catch (dbError) {
        console.warn('Firestore verification error:', dbError);

        // Fallback for mock mode
        if (otp === '123456') {
          const customToken = await admin.auth().createCustomToken(email.toLowerCase());
          res.status(200).json({
            success: true,
            token: customToken,
            email: email.toLowerCase(),
            message: 'Login successful (mock mode)'
          });
        } else {
          res.status(401).json({ error: 'Invalid OTP' });
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Cloud Function: Clean up expired OTPs (scheduled)
export const cleanupExpiredOTPs = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const now = admin.firestore.Timestamp.now();
      const snapshot = await db.collection('teacherOTPs')
        .where('expiryTime', '<', now)
        .where('verified', '==', false)
        .get();

      let deletedCount = 0;
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });

      if (deletedCount > 0) {
        await batch.commit();
        console.log(`Deleted ${deletedCount} expired OTPs`);
      }

      return { success: true, deletedCount };
    } catch (error) {
      console.error('Cleanup OTPs error:', error);
      return { error: 'Cleanup failed' };
    }
  });

// Cloud Function: Generate vocabulary with Claude
export const generateVocabularyWithClaude = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // ✅ SECURITY: Verify user is authenticated via Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
      }

      const idToken = authHeader.split('Bearer ')[1];
      try {
        // Verify the Firebase ID token
        await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
      }

      const { theme, count } = req.body;

      if (!theme || !count) {
        return res.status(400).json({ error: 'Missing theme or count' });
      }

      const claudeApiKey = process.env.CLAUDE_API_KEY;
      if (!claudeApiKey) {
        return res.status(500).json({ error: 'Claude API key not configured' });
      }

      // Call Claude API to generate vocabulary
      const prompt = `Generate exactly ${count} vocabulary items for learning Indonesian about the theme: "${theme}".

Return ONLY a valid JSON array with exactly this format, no other text:
[
  {"bahasa": "word in indonesian", "english": "english translation"},
  {"bahasa": "word in indonesian", "english": "english translation"}
]

Requirements:
- Each item must have exactly "bahasa" and "english" fields
- All ${count} items must be related to the theme: ${theme}
- Use simple, common words suitable for children
- No duplicates
- Return valid JSON only, no markdown formatting or extra text`;

      console.log('🤖 Calling Claude API with theme:', theme);

      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-1',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!claudeResponse.ok) {
        const errorText = await claudeResponse.text();
        console.error('Claude API error:', claudeResponse.status, errorText);
        throw new Error(`Claude API error: ${claudeResponse.status}`);
      }

      const claudeData: any = await claudeResponse.json();
      console.log('Claude response:', claudeData);

      // Parse Claude's response
      let vocabularyItems: any[] = [];
      
      if (claudeData.content && claudeData.content[0] && claudeData.content[0].text) {
        const responseText = claudeData.content[0].text;
        console.log('Claude text response:', responseText);
        
        // Try to extract JSON from the response
        try {
          // Try direct JSON parse first
          vocabularyItems = JSON.parse(responseText);
        } catch (e) {
          // Try extracting JSON from markdown code blocks
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            vocabularyItems = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Could not parse Claude response as JSON');
          }
        }
      }

      if (!Array.isArray(vocabularyItems) || vocabularyItems.length === 0) {
        throw new Error('Claude did not return valid vocabulary array');
      }

      console.log(`✅ Generated ${vocabularyItems.length} items for theme "${theme}":`, vocabularyItems);

      // Create options for each item (3 options: 1 correct + 2 random)
      const itemsWithOptions = vocabularyItems.slice(0, count).map((item: any, idx: number) => {
        const otherWords = vocabularyItems
          .filter((_: any, i: number) => i !== idx)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .map((w: any) => w.bahasa);

        const options = [item.bahasa, ...otherWords].sort(() => Math.random() - 0.5);

        return {
          bahasa: item.bahasa,
          english: item.english,
          options: options,
          correctAnswer: item.bahasa,
          imageUrl: null
        };
      });

      res.status(200).json({ success: true, items: itemsWithOptions });
    } catch (error: any) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate vocabulary' });
    }
  });
});

// Helper function to generate image with Stability AI
async function generateImageWithStability(word: string, english: string): Promise<string | null> {
  try {
    const stabilityKey = process.env.STABILITY_API_KEY;
    if (!stabilityKey) {
      console.error('Stability API key not configured');
      return null;
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: `A clear, simple illustration of a ${word} (${english}). Simple, clean style, white background, centered, professional quality, suitable for children's learning materials.`,
            weight: 1
          }
        ],
        negative_prompts: [
          {
            text: 'text, watermark, blurry, low quality, distorted, complex, busy',
            weight: -1
          }
        ],
        steps: 30,
        width: 1024,
        height: 1024,
        guidance_scale: 7,
        seed: Math.floor(Math.random() * 1000000)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Stability API error:', errorData);
      return null;
    }

    const data = await response.json() as any;
    
    if (data.artifacts && data.artifacts[0]) {
      const base64Image = data.artifacts[0].base64;
      
      // Upload to Firebase Storage using Admin SDK
      const bucket = admin.storage().bucket();
      const fileName = `ai-vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
      const file = bucket.file(`vocabularies/${fileName}`);
      
      // Convert base64 to Buffer for Firebase Admin SDK
      const buffer = Buffer.from(base64Image, 'base64');
      
      await file.save(buffer, {
        metadata: {
          contentType: 'image/png'
        }
      });

      // Generate download URL
      const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      console.log(`✅ Image generated and uploaded for ${word}`);
      return url;
    }
    
    return null;
  } catch (err) {
    console.error('Error generating image with Stability:', err);
    return null;
  }
}

// Cloud Function: Health check
export const health = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      email: process.env.TEACHER_EMAIL_USER ? 'configured' : 'not configured'
    });
  });
});

// Cloud Function: Generate SPO sentences
export const generateSPOSentences = functions.https.onCall(async (data, context) => {
  // ✅ SECURITY: Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to generate SPO sentences'
    );
  }

  try {
    const { difficulty, count } = data;
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    const prompts: Record<string, string> = {
      easy: `Generate ${count} VERY SIMPLE Indonesian S-P-O sentences for beginners. Each sentence should have EXACTLY 3 words:
- Subject (simple noun): animals, people, or common objects
- Predicate (simple verb): eating, playing, running, jumping, sleeping
- Object (simple noun): food or objects

Requirements:
- Only use most common beginner words
- Keep sentences extremely simple (3 words only)
- No complex grammar
- Present tense only

Format each as:
SENTENCE: [Indonesian sentence]
SUBJECT: [subject] ([English])
PREDICATE: [verb] ([English])
OBJECT: [object] ([English])

Generate exactly ${count} sentences. Start with: SENTENCE 1:`,

      moderate: `Generate ${count} Indonesian S-P-O sentences at intermediate level. Each sentence should have 4-5 words:
- Subject: simple adjective + noun or just noun
- Predicate: verb with optional adverb
- Object: noun with optional adjective

Requirements:
- Use common vocabulary
- Mix of verb types (action verbs, states)
- 4-5 words per sentence
- Present and simple past tenses

Format each as:
SENTENCE: [Indonesian sentence]
SUBJECT: [subject] ([English])
PREDICATE: [verb] ([English])
OBJECT: [object] ([English])

Generate exactly ${count} sentences. Start with: SENTENCE 1:`,

      hard: `Generate ${count} Indonesian S-P-O sentences at advanced level. Each sentence should have 5-7 words:
- Subject: adjective + noun or possessive structures
- Predicate: verb with adverbs or auxiliary verbs
- Object: adjective + noun or complex phrases

Requirements:
- Use intermediate vocabulary
- Include various verb forms
- 5-7 words per sentence
- Multiple tenses (present, past, future)

Format each as:
SENTENCE: [Indonesian sentence]
SUBJECT: [subject] ([English])
PREDICATE: [verb] ([English])
OBJECT: [object] ([English])

Generate exactly ${count} sentences. Start with: SENTENCE 1:`
    };

    const prompt = prompts[difficulty] || prompts.moderate;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json() as any;
    return {
      text: result.content[0].text,
      success: true,
    };
  } catch (error) {
    console.error('Error generating SPO sentences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate SPO sentences';
    throw new functions.https.HttpsError('internal', errorMessage);
  }
});

