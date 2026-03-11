import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkNpmToolAvailable, checkBinaryAvailable } from "./adapter-utils.js";

export class BackstopAdapter extends BaseAdapter {
  constructor() {
    super("backstop");
  }

  async isAvailable(): Promise<boolean> {
    const hasNpm = await checkNpmToolAvailable("backstop");
    if (!hasNpm) return false;
    const hasBrowser = await checkBinaryAvailable("chromium") || await checkBinaryAvailable("google-chrome");
    return hasBrowser;
  }

  protected getInstallHint(): string {
    return "Install BackstopJS: npm install --save-dev backstopjs (requires Chrome/Chromium)";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "not_available",
      message: "BackstopJS requires visual reference images and browser. Configure backstop.json to enable.",
      score: 0,
      durationMs: 0,
      evidence: {
        adapter: this.id,
        reason: "not_configured",
        installHint: this.getInstallHint(),
      },
    };
  }
}
