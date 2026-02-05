import { GoogleGenerativeAI } from "@google/generative-ai";


export async function askGemini(prompt: string, jsonResponse = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try primary model first (using currently supported model)
  let modelName = "gemini-2.0-flash";
  let model = genAI.getGenerativeModel({ model: modelName });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (jsonResponse) {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch (e) {
          throw new Error(`JSON Parse Error: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      throw new Error("AI output did not contain valid JSON");
    }
    return text;

  } catch (error: any) {
    console.warn(`[Gemini] Primary model ${modelName} failed. Attempting fallback...`, error.message);
    
    // Fallback to gemini-2.5-flash if gemini-2.0-flash fails
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      // Handle JSON extraction for fallback too...
      if (jsonResponse) {
         const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
         if (jsonMatch) return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      return text;
    } catch (fallbackError: any) {
      console.error("[Gemini] Both primary and fallback models failed.");
      throw new Error(`Gemini API Error: ${error.message} (Fallback Also Failed: ${fallbackError.message})`);
    }
  }
}
