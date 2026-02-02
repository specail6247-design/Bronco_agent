import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askGemini(prompt: string, jsonResponse = false) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  if (jsonResponse) {
    // Try to extract JSON if it's wrapped in markdown
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini:", text);
        throw new Error("Invalid JSON format received from AI");
      }
    } else {
      throw new Error("AI failed to provide a valid JSON response");
    }
  }

  return text;
}
