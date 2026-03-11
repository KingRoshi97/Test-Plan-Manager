import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkBinaryAvailable } from "./adapter-utils.js";

export class K6Adapter extends BaseAdapter {
  constructor() {
    super("k6");
  }

  async isAvailable(): Promise<boolean> {
    return checkBinaryAvailable("k6");
  }

  protected getInstallHint(): string {
    return "Install k6: brew install k6 or download from https://k6.io/";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "not_available",
      message: "k6 load testing requires test scripts to be configured",
      score: 0,
      durationMs: 0,
      evidence: {
        adapter: this.id,
        reason: "no_test_scripts",
        installHint: this.getInstallHint(),
      },
    };
  }
}
