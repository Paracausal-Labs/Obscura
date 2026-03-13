import { checkKillSwitch } from "../integrations/ens";
import type { AgentContext, ActivityEmitter } from "./types";
import type { AgentRole, AgentResult } from "@obscura/shared";

export abstract class BaseAgent {
  abstract role: AgentRole;

  protected emit: ActivityEmitter;

  constructor(emit: ActivityEmitter) {
    this.emit = emit;
  }

  async run(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const toolsCalled: string[] = [];

    try {
      // Check kill switch
      const killed = await checkKillSwitch(context.userEnsName);
      if (killed) {
        this.emit({
          agent: this.role,
          type: "killswitch",
          message: `Kill switch active — ${this.role} will not execute`,
          jobId: Number(context.job.id),
        });
        return {
          success: false,
          deliverableHash: "",
          metadata: { toolsCalled: [], duration: Date.now() - startTime, reasoning: "Kill switch active" },
        };
      }

      this.emit({
        agent: this.role,
        type: "pickup",
        message: `${this.role}.eth picked up Job #${context.job.id}`,
        jobId: Number(context.job.id),
      });

      const result = await this.execute(context, toolsCalled);

      return {
        ...result,
        metadata: {
          ...result.metadata,
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.emit({
        agent: this.role,
        type: "error",
        message: `${this.role}.eth failed: ${message}`,
        jobId: Number(context.job.id),
      });
      return {
        success: false,
        deliverableHash: "",
        metadata: {
          toolsCalled,
          duration: Date.now() - startTime,
          reasoning: `Error: ${message}`,
        },
      };
    }
  }

  protected abstract execute(
    context: AgentContext,
    toolsCalled: string[]
  ): Promise<AgentResult>;

  protected emitToolCall(toolName: string, jobId: number) {
    this.emit({
      agent: this.role,
      type: "tool_call",
      message: `${this.role} → ${toolName}`,
      jobId,
    });
  }
}
