
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    // Start streaming content
    const response = await ai.models.generateContentStream({
      model: 'gemma-3-27b-it',
      contents: prompt,
    });

    let fullText = '';

    // Iterate over each chunk from the stream
    for await (const chunk of response) {
      console.log('Chunk received:', chunk.text);
      fullText += chunk.text;
    }

    console.log('Full text:', fullText);

    res.status(200).json({ text: fullText });
  } catch (err) {
    console.error('Error generating content:', err);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
}
