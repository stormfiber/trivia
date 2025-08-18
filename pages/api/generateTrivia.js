import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  // Use server-side only env variable
  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemma3-27b-it",
      contents: prompt,
    });

    res.status(200).json({ text: response.text });
  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
}
