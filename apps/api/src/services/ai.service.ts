// src/services/ai.service.ts
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import env from "../../env";

export class AIService {
  private model;

  constructor() {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    this.model = googleProvider("gemini-2.5-flash");
  }

  async generateSummary(prompt: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: prompt,
        temperature: 0.7,
      });
      return text.trim();
    } catch (error) {
      console.error("AI Generation Failed:", error);
      throw new Error("AI_SERVICE_ERROR");
    }
  }
}
