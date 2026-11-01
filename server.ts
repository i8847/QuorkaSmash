import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Curated fallbacks for offline or unconfigured API keys
const FALLBACK_COMMENTARIES = [
  {
    badgeTitle: "Han Quorka Twin",
    quote: "That fluffy cheek bounce was pure Han Jisung energy! You smacked that Quorka with chef-tier precision!",
    cheer: "YOU MAKE STRAY KIDS STAY!",
    mvpMember: "Han Jisung (Quorka Twin)",
    rating: "S-Tier STAY"
  },
  {
    badgeTitle: "Thunderous Rally King",
    quote: "BOOM! Look at that combo! Bang Chan is nodding proudly from the recording studio!",
    cheer: "SSORIKKUN ENERGY UNLEASHED!",
    mvpMember: "Bang Chan",
    rating: "5-Star Michelin"
  },
  {
    badgeTitle: "Maniac Spin Master",
    quote: "That Quorka was spinning out of control like Felix dropping his deepest bass line!",
    cheer: "GOING CRAZY LIKE A MANIAC!",
    mvpMember: "Felix",
    rating: "Supreme STAY"
  },
  {
    badgeTitle: "God's Menu Smackdown",
    quote: "Tang, tang, tang! Cooked that paddle return like a Michelin dish on God's Menu!",
    cheer: "NE SONNIM!",
    mvpMember: "Lee Know & Hyunjin",
    rating: "Cooking Master"
  },
  {
    badgeTitle: "Changbin's Power Forehand",
    quote: "YOH! Pure Dwaekki muscle behind that paddle! The Quorka never stood a chance!",
    cheer: "JUTDAE POWER!",
    mvpMember: "Changbin",
    rating: "Heavyweight Champion"
  }
];

// AI Commentary Endpoint
app.post('/api/commentary', async (req, res) => {
  const { score = 0, maxCombo = 0, hits = 0, livesLost = 0, name = 'Stay' } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    const fallback = FALLBACK_COMMENTARIES[Math.floor(Math.random() * FALLBACK_COMMENTARIES.length)];
    return res.json({
      ...fallback,
      isAiGenerated: false
    });
  }

  try {
    const prompt = `The player "${name}" just finished a match of Quorka Smash (a Stray Kids-themed table tennis game where they paddle a deranged fluffy quokka creature).
Match statistics:
- Score: ${score} points
- Max Combo: ${maxCombo} consecutive smashes
- Total Hits: ${hits}
- Lives Lost: ${livesLost}

Generate a short, playful, Stray Kids-themed cheer squad commentary and collectible badge. React authentically to their performance (higher praise for high combos/scores, funny encouragement for early game over). Playfully include Stray Kids iconic motifs (Han's quokka resemblance, God's Menu cooking, Thunderous, Maniac, Bang Chan leader encouragement, Felix bass voice, Stray Kids Stay).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are the lively, hilarious Stay Cheer Squad commentator for 'Quorka Smash'. You speak in fun, upbeat K-pop fan / Stay hype tone with clever Stray Kids references. Always output strictly valid JSON matching the schema.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            badgeTitle: {
              type: Type.STRING,
              description: "A punchy, creative 2-4 word Stray Kids themed badge title (e.g. 'Thunderous Smack Pro', 'Han Quorka Whisperer', 'Maniac Reflex Stay').",
            },
            quote: {
              type: Type.STRING,
              description: "1-2 sentences of enthusiastic, funny commentary on the match results.",
            },
            cheer: {
              type: Type.STRING,
              description: "A short, memorable shout or slogan in all caps (e.g. 'YOU MAKE STRAY KIDS STAY!', 'COOKIN LIKE A CHEF!').",
            },
            mvpMember: {
              type: Type.STRING,
              description: "The Stray Kids member most impressed by this match.",
            },
            rating: {
              type: Type.STRING,
              description: "A fun rank title like 'S-Tier STAY', 'Michelin Chef', 'Channie Certified'.",
            },
          },
          required: ["badgeTitle", "quote", "cheer", "mvpMember", "rating"],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      isAiGenerated: true
    });
  } catch (error) {
    console.error('Gemini commentary error, using fallback:', error);
    const fallback = FALLBACK_COMMENTARIES[Math.floor(Math.random() * FALLBACK_COMMENTARIES.length)];
    return res.json({
      ...fallback,
      isAiGenerated: false
    });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`Quorka Smash server listening on http://localhost:${PORT}`);
  });
}

startServer();
