import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const askGemini = async (prompt) => {
  // Add platform context and word limit to every prompt
  const platformContext = "You are an AI assistant for an HR and Recruitment platform. Only answer questions related to HR, recruitment, employee management, analytics, and related business topics. If asked about anything else, politely refuse. Limit your answer to 100 words or less.";
  const fullPrompt = `${platformContext}\nUser: ${prompt}`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
  });
  return response.text || "No response";
};
