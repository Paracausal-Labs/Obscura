import { createGroq } from "@ai-sdk/groq";
import { generateText, type ToolSet, stepCountIs } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export const MODEL = groq("llama-3.3-70b-versatile");

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
    stopWhen: stepCountIs(params.maxSteps ?? 5),
  });
}
