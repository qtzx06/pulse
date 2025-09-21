import { GoogleGenAI } from "@google/genai";

const instruction = `
You are a music control agent. Your job is to parse a user's text prompt
and create a "mix" by selecting multiple prompts from a provided list and assigning them weights.
You will also extract musical parameters from the user's text.

You should output a JSON object with the following properties:
- "prompts": An array of objects, where each object has a "prompt_name" (string) and a "weight" (float between 0.0 and 1.0).
- "bpm": The beats per minute, as an integer.
- "density": A float between 0.0 and 1.0.
- "brightness": A float between 0.0 and 1.0.

Select a combination of prompts that best represents the user's request.

IMPORTANT: If the user's prompt is empty, vague, or nonsensical, your response should be a JSON object containing a "prompts" array with three different, randomly selected prompts from the provided list, each with a random weight.

Example:
User prompt: "I want to hear some fast, heavy dubstep with a punchy kick drum"
Available Prompts: ["Bossa Nova", "Chillwave", "Drum and Bass", "Dubstep", "Punchy Kick", "K Pop"]
Output:
{
  "prompts": [
    { "prompt_name": "Dubstep", "weight": 0.9 },
    { "prompt_name": "Punchy Kick", "weight": 0.2 }
  ],
  "bpm": 140,
  "density": 0.8,
  "brightness": 0.6
}
`;

export async function parsePromptWithGemini(genAI: GoogleGenAI, text: string, availablePrompts: string[]): Promise<any> {
  try {
    const fullPrompt = `${instruction}\n\nAvailable Prompts: ${JSON.stringify(availablePrompts)}\n\nUser prompt: "${text}"`;
    
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const jsonText = result.text?.replace(/```json\n?|\n?```/g, '') || '{}';
    console.log("Control Agent Raw JSON:", jsonText);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing prompt with Gemini:", error);
    return null;
  }
}