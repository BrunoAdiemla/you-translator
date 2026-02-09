import { GoogleGenAI, Type } from "@google/genai";
import { Language, Difficulty, EvaluationResult } from "../types";

// Fix: Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generatePhrase(language: Language, level: Difficulty): Promise<string> {
    const prompt = `Generate a short phrase in ${language} to be translated into English for a ${level} level student. 
    Focus on everyday usage. 
    Basic: simple present, common nouns. 
    Intermediate: past/future, common idioms. 
    Advanced: complex clauses, formal/business English, rare idioms.
    Return ONLY the phrase, no other text.`;

    // Fix: Use ai.models.generateContent with appropriate model and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Fix: Access the .text property directly instead of calling it as a method
    return response.text?.trim() || "Olá, como vai você?";
  },

  async evaluateTranslation(
    originalPhrase: string, 
    userTranslation: string, 
    level: Difficulty,
    language: Language
  ): Promise<EvaluationResult> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate the following English translation from ${language}.
      Original: "${originalPhrase}"
      User Translation: "${userTranslation}"
      Difficulty: ${level}

      Provide your evaluation in strict JSON format with the following keys:
      - score: number (0-10)
      - correction: string (the perfect English translation)
      - explanation: string (pedagogical explanation in ${language})
      - tips: array of strings (how to improve)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            correction: { type: Type.STRING },
            explanation: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "correction", "explanation", "tips"]
        }
      }
    });

    try {
      // Fix: Ensure we are using the .text property correctly
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr) as EvaluationResult;
    } catch (e) {
      console.error("Error parsing AI response", e);
      return {
        score: 0,
        correction: "Could not evaluate. Please try again.",
        explanation: "Ocorreu um erro ao processar sua resposta.",
        tips: ["Tente novamente em instantes."]
      };
    }
  }
};
