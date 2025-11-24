import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const STABILITY_API_KEY = (process.env.STABILITY_API_KEY || '').trim();
// Using stable-image-ultra which is the latest model
const STABILITY_API_URL = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';

// Log API key status on startup
console.log(`Claude API Key configured: ${CLAUDE_API_KEY ? 'Yes (' + CLAUDE_API_KEY.substring(0, 20) + '...)' : 'No'}`);
console.log(`Stability API Key configured: ${STABILITY_API_KEY ? 'Yes (' + STABILITY_API_KEY.substring(0, 20) + '...)' : 'No'}`);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', apiKey: CLAUDE_API_KEY ? 'configured' : 'missing' });
});

app.post('/api/generate-vocabulary', async (req, res) => {
  try {
    const { theme, gradeLevel, count = 10 } = req.body;

    // Mock data that works immediately
    const mockData = {
      'animals': [
        { english: 'Cat', bahasa: 'Kucing', syllables: 'Ku-cing', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', example: 'Kucing saya lucu' },
        { english: 'Dog', bahasa: 'Anjing', syllables: 'An-jing', imageUrl: 'https://images.unsplash.com/photo-1633722715463-d30628cffb75?w=400', example: 'Anjing saya pintar' },
        { english: 'Bird', bahasa: 'Burung', syllables: 'Bu-rung', imageUrl: 'https://images.unsplash.com/photo-1444464666175-1cff94d85e8b?w=400', example: 'Burung terbang tinggi' },
        { english: 'Fish', bahasa: 'Ikan', syllables: 'I-kan', imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', example: 'Ikan berenang di air' },
        { english: 'Lion', bahasa: 'Singa', syllables: 'Si-nga', imageUrl: 'https://images.unsplash.com/photo-1456182251766-d0d1ff16a9d4?w=400', example: 'Singa itu kuat' }
      ],
      'colors': [
        { english: 'Red', bahasa: 'Merah', syllables: 'Me-rah', imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400', example: 'Warna merah cerah' },
        { english: 'Blue', bahasa: 'Biru', syllables: 'Bi-ru', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', example: 'Langit biru indah' },
        { english: 'Yellow', bahasa: 'Kuning', syllables: 'Ku-ning', imageUrl: 'https://images.unsplash.com/photo-1591290621749-2127d7b31313?w=400', example: 'Bunga kuning cantik' },
        { english: 'Green', bahasa: 'Hijau', syllables: 'Hi-jau', imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f8a9cc46?w=400', example: 'Daun hijau subur' },
        { english: 'Black', bahasa: 'Hitam', syllables: 'Hi-tam', imageUrl: 'https://images.unsplash.com/photo-1518495238370-0461a8f918de?w=400', example: 'Cat hitam gelap' }
      ],
      'food': [
        { english: 'Apple', bahasa: 'Apel', syllables: 'A-pel', imageUrl: 'https://images.unsplash.com/photo-1560806674-d14c3f5e0b5a?w=400', example: 'Apel itu manis' },
        { english: 'Banana', bahasa: 'Pisang', syllables: 'Pi-sang', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', example: 'Pisang sangat lezat' },
        { english: 'Orange', bahasa: 'Jeruk', syllables: 'Je-ruk', imageUrl: 'https://images.unsplash.com/photo-1611080626919-d2deda65d5b7?w=400', example: 'Jeruk asam segar' },
        { english: 'Bread', bahasa: 'Roti', syllables: 'Ro-ti', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', example: 'Roti putih lembut' },
        { english: 'Milk', bahasa: 'Susu', syllables: 'Su-su', imageUrl: 'https://images.unsplash.com/photo-1608270861620-7fd0c2cc4a5d?w=400', example: 'Susu hangat nikmat' }
      ]
    };

    // Get theme-based words or use animals as default
    const themeKey = theme.toLowerCase().substring(0, 1);
    let wordList = mockData['animals'];
    
    if (theme.toLowerCase().includes('color') || theme.toLowerCase().includes('warna')) {
      wordList = mockData['colors'];
    } else if (theme.toLowerCase().includes('food') || theme.toLowerCase().includes('makanan')) {
      wordList = mockData['food'];
    }

    // If Claude API is configured and working, try to use it
    if (CLAUDE_API_KEY && CLAUDE_API_KEY.startsWith('sk-')) {
      try {
        const prompt = `You are an expert Bahasa Indonesia teacher for Grade ${gradeLevel} students (ages 6-8).
Generate ${count} vocabulary words about "${theme}" suitable for early learners.
For each word provide JSON with: english, bahasa, syllables (hyphen-separated), imageUrl, example.
Return ONLY a JSON array, no other text.`;

        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2024-06-15'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.content[0].text;
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const words = JSON.parse(jsonMatch[0]);
            return res.json({ words: words.slice(0, count) });
          }
        }
      } catch (e) {
        console.log('Claude API call failed, using fallback data:', e.message);
      }
    }

    // Return mock data as fallback
    res.json({ words: wordList.slice(0, count) });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/improve-syllables', async (req, res) => {
  try {
    const { bahasaWord } = req.body;

    // Simple fallback syllabification using regex
    const syllabifySimple = (w) => {
      const syllables = w.match(/[^aeiou]*[aeiou]+/gi) || [w];
      return syllables.join('-');
    };

    const simpleSyllables = syllabifySimple(bahasaWord);
    
    // If Claude is available, try to use it for better results
    if (CLAUDE_API_KEY && CLAUDE_API_KEY.startsWith('sk-')) {
      try {
        const response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2024-06-15'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 100,
            messages: [{
              role: 'user',
              content: `Break this Bahasa Indonesia word into syllables using hyphens. Return ONLY the syllabified word, nothing else.\n\nWord: ${bahasaWord}`
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const syllables = data.content[0].text.trim();
          return res.json({ syllables });
        }
      } catch (e) {
        console.log('Claude API failed for syllables, using fallback:', e.message);
      }
    }

    // Return simple syllabification as fallback
    res.json({ syllables: simpleSyllables });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, customPrompt } = req.body;

    // Use custom prompt if provided, otherwise use the base prompt
    const finalPrompt = (customPrompt && customPrompt.trim()) ? customPrompt.trim() : prompt;

    if (!finalPrompt || finalPrompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!STABILITY_API_KEY || STABILITY_API_KEY.trim().length === 0) {
      return res.status(500).json({ error: 'Stability API key not configured' });
    }

    const enhancedPrompt = `A simple, colorful, educational illustration of ${finalPrompt}. Suitable for children's language learning. Clear, bright, and recognizable object. Simple cartoon style.`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('output_format', 'jpeg');
    formData.append('aspect_ratio', '1:1');

    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*',
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Stability API error response:', response.status, error);
      return res.status(response.status).json({ error: `Stability API error: ${error}` });
    }

    // The v2beta API returns the image directly as a blob
    const buffer = await response.buffer();
    const imageBase64 = buffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
    
    res.json({ imageUrl: imageDataUrl });

  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
