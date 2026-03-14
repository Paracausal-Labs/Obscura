import { createGroq } from "@ai-sdk/groq";
import { generateText, type ToolSet, stepCountIs } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODEL = groq("llama-3.3-70b-versatile");

export async function runAgent(params: {
  system: string;
  prompt: string;
  tools: ToolSet;
  maxSteps?: number;
}) {
  try {
    return await generateText({
      model: MODEL,
      system: params.system,
      prompt: params.prompt,
      tools: params.tools,
      stopWhen: stepCountIs(params.maxSteps ?? 10),
    });
  } catch (err) {
    // Groq sometimes fails mid-generation with malformed tool calls.
    // Return a partial result so the agent can still produce a report.
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("failed_generation") || msg.includes("Failed to call")) {
      return {
        text: `Agent encountered a tool calling error but completed partial research. Error: ${msg.slice(0, 200)}`,
        steps: [],
        toolCalls: [],
        toolResults: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        finishReason: "error" as const,
        response: { id: "", timestamp: new Date(), modelId: "" },
        reasoning: undefined,
        sources: [],
        experimental_output: undefined,
        rawCall: { rawPrompt: undefined, rawSettings: {} },
      };
    }
    throw err;
  }
}
