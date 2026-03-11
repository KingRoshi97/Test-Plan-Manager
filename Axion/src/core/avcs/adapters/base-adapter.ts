import type {
  AVCSToolAdapter,
  AVCSTestDefinition,
  AVCSTestResult,
  ToolAdapterContext,
} from "../types.js";
import { makeSkipResult, makeErrorResult } from "./adapter-utils.js";

export abstract class BaseAdapter implements AVCSToolAdapter {
  id: string;
  toolId: string;

  constructor(toolId: string) {
    this.toolId = toolId;
    this.id = `${toolId}-adapter`;
  }

  abstract isAvailable(): Promise<boolean>;
  abstract runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult>;

  async execute(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const available = await this.isAvailable();
    if (!available) {
      return makeSkipResult(test, this.toolId, `${this.toolId} is not available`, this.getInstallHint());
    }

    try {
      return await this.runTool(test, context);
    } catch (err: any) {
      return makeErrorResult(test, this.toolId, err.message ?? String(err), 0);
    }
  }

  protected getInstallHint(): string {
    return `Install ${this.toolId} to enable this check`;
  }
}
