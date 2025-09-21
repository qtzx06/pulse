import { GoogleGenAI } from "@google/genai";

const instruction = `
You are a music control agent. Your job is to parse a user's text prompt
and extract musical parameters to control a music generation model.

You should output a JSON object with the following properties:
- "prompt": A refined prompt for the music generation model. This should be a clean, descriptive string.
- "bpm": The beats per minute, as an integer.
- "density": A float between 0.0 and 1.0.
- "brightness": A float between 0.0 and 1.0.

If a parameter is not specified in the user's prompt, you can use a reasonable default or omit it.

Example:
User prompt: "slow, sad, ambient music with a sparse beat"
Output:
{
  "prompt": "slow, sad, ambient music with a sparse beat",
  "bpm": 80,
  "density": 0.3,
  "brightness": 0.4
}
`;

export async function parsePromptWithGemini(genAI: GoogleGenAI, text: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent([instruction, text]);
    const response = await result.response;
    const jsonText = response.text().replace(/```json\n?|\n?```/g, '');
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing prompt with Gemini:", error);
    return null;
  }
}
