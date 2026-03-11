import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkNpmToolAvailable, checkBinaryAvailable } from "./adapter-utils.js";

export class PallyAdapter extends BaseAdapter {
  constructor() {
    super("pa11y");
  }

  async isAvailable(): Promise<boolean> {
    const hasNpm = await checkNpmToolAvailable("pa11y");
    if (!hasNpm) return false;
    const hasBrowser = await checkBinaryAvailable("chromium") || await checkBinaryAvailable("google-chrome");
    return hasBrowser;
  }

  protected getInstallHint(): string {
    return "Install Pa11y: npm install --save-dev pa11y (requires Chrome/Chromium)";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "not_available",
      message: "Pa11y requires a running browser. Install Chromium to enable accessibility testing.",
      score: 0,
      durationMs: 0,
      evidence: {
        adapter: this.id,
        reason: "browser_not_available",
        installHint: this.getInstallHint(),
      },
    };
  }
}
