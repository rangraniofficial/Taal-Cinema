import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Choreography and Song Sync Endpoint
app.post('/api/gemini/generate-choreography', async (req, res) => {
  try {
    const { songTitle, bpm, mood, style, outfit } = req.body;

    const prompt = `You are a legendary Bollywood choreographer and cinematic music video director (working in the tradition of Sanjay Leela Bhansali and Farah Khan).
Create an ultra-detailed, shot-by-shot synchronized dance choreography breakdown for a 9:16 vertical Bollywood reel/music video.
Key details:
- Song: ${songTitle || 'Dhol Baje & Kesariya Fusion'}
- Tempo: ${bpm || 128} BPM
- Mood: ${mood || 'Joyous, Romantic, Cinematic'}
- Dancer: Beautiful 24-year-old Indian woman
- Costume: ${outfit || 'Royal blue & gold zardozi embroidered saree with golden borders and traditional jhumkas'}
- Setting: Grand Indian wedding stage decorated with warm golden fairy lights, glowing lanterns, and floral drapes.

Generate a structured sequence with 6 choreographed cinematic shots that flow seamlessly together:
1. Opening Medium Shot (smiling naturally, subtle sway, eyes making playful contact with camera)
2. Classical Mudra & Hand Gestures (wrist rotation, traditional Indian hand gesture, graceful smile)
3. Shoulder & Hip Sway (rhythmic footwork, side steps, waist movement synchronized with dholak/tabla beats)
4. Grand 360-degree Twirl (saree pallu flowing naturally with realistic fabric physics, gold border shimmering)
5. Dynamic Chorus Hook Step (both hands raised, joyful energetic Bollywood dance steps, high charisma)
6. Grand Final Pose (graceful spin, namaste/dance mudra, confident glowing smile, slow camera push-in)

Include camera moves (medium shot, full tracking, 360 orbit, push-in), musical beat cues, timing in seconds, and facial expression cues.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            overallMood: { type: Type.STRING },
            shots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  shotNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  durationSec: { type: Type.NUMBER },
                  cameraMovement: { type: Type.STRING },
                  danceStep: { type: Type.STRING },
                  mudra: { type: Type.STRING },
                  expression: { type: Type.STRING },
                  fabricPhysics: { type: Type.STRING },
                  audioBeatSync: { type: Type.STRING },
                  cinematicPrompt: { type: Type.STRING },
                },
                required: [
                  'shotNumber',
                  'title',
                  'timestamp',
                  'durationSec',
                  'cameraMovement',
                  'danceStep',
                  'expression',
                  'cinematicPrompt',
                ],
              },
            },
            directorNotes: { type: Type.STRING },
          },
          required: ['title', 'bpm', 'shots', 'directorNotes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating choreography:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate choreography breakdown',
    });
  }
});

// Video Prompt Suite Generator for Veo 2 / Sora / Kling / Runway
app.post('/api/gemini/generate-video-prompts', async (req, res) => {
  try {
    const { shotName, outfitStyle, cameraAngle, intensity } = req.body;

    const prompt = `You are an AI Video Prompt Engineer specializing in Google Veo 2, OpenAI Sora, Kling 1.5, and Runway Gen-3.
Craft the ultimate photorealistic video prompt for:
- Shot: ${shotName || 'Bollywood Dance Twirl and Hook Step'}
- Character: 24-year-old beautiful Indian woman with exact consistent facial features, almond eyes, gentle bindi, dark flowing wavy hair, and delicate jewelry from reference image.
- Outfit: ${outfitStyle || 'Royal blue saree with intricate gold zardozi embroidery, golden border, and matching embroidered blouse'}
- Camera: ${cameraAngle || 'Vertical 9:16, cinematic medium-to-full body tracking shot with gentle orbit'}
- Lighting & Stage: Luxurious Indian wedding dance stage decorated with warm golden fairy lights, flowers, glowing lanterns, and colorful cinematic lighting.
- Dance Energy: ${intensity || 'High energy, graceful, perfectly synchronized to rhythmic Bollywood beats'}

Output a JSON object with:
1. mainPrompt: Comprehensive, photorealistic prompt ready to paste into Veo 2 or Kling with zero quality loss.
2. negativePrompt: Detailed negative prompt avoiding common video defects.
3. cameraMotionConfig: Specific camera movement instructions (pan, tilt, zoom speed, orbit degrees).
4. fabricDynamicsNotes: Details on saree pallu movement and drapery physics.
5. characterConsistencyAnchors: Key identity preserve tokens to ensure facial and jewelry consistency.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainPrompt: { type: Type.STRING },
            negativePrompt: { type: Type.STRING },
            cameraMotionConfig: { type: Type.STRING },
            fabricDynamicsNotes: { type: Type.STRING },
            characterConsistencyAnchors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedSettings: {
              type: Type.OBJECT,
              properties: {
                aspectRatio: { type: Type.STRING },
                fps: { type: Type.INTEGER },
                resolution: { type: Type.STRING },
                motionBucket: { type: Type.INTEGER },
              },
            },
          },
          required: [
            'mainPrompt',
            'negativePrompt',
            'cameraMotionConfig',
            'characterConsistencyAnchors',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating video prompts:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate video prompt suite',
    });
  }
});

// Interactive Choreography Assistant / Dance Director Chat
app.post('/api/gemini/direct-scene', async (req, res) => {
  try {
    const { userInstruction, currentShotIndex } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the lead Bollywood dance director for this cinematic video shoot.
The current shot index is ${currentShotIndex}.
The user requests adjustments: "${userInstruction}"

Give a sharp, inspiring director feedback response (2-3 sentences max) explaining how you are tweaking the camera angle, timing, hand mudras, or saree movement, followed by a refined prompt snippet.`,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ success: true, advice: response.text });
  } catch (error: any) {
    console.error('Director feedback error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get director feedback',
    });
  }
});

// Static assets and Vite integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Taal Cinema Studio server running on port ${PORT}`);
});
