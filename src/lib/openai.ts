import OpenAI from "openai";

// Initialize OpenAI client with environment variables
export const openai = new OpenAI({
  apiKey: process.env.LLM_KEY,
  baseURL: process.env.LLM_URL,
});

// Helper function to get model name from environment
export function getModelName(): string {
  return process.env.LLM_NAME || "deepseek-v3-250324";
}
