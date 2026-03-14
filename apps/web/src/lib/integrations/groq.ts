import { createGroq } from "@ai-sdk/groq";
import { generateText, type ToolSet, stepCountIs } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODEL = groq("meta-llama/llama-4-scout-17b-16e-instruct");

export async function runAgent(params: {
  system: string;
  prompt: string;
  tools: ToolSet;
  maxSteps?: number;
}) {
  return generateText({
    model: MODEL,
    system: params.system,
    prompt: params.prompt,
    tools: params.tools,
    stopWhen: stepCountIs(params.maxSteps ?? 10),
  });
}
