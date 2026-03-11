import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkNpmToolAvailable, checkBinaryAvailable } from "./adapter-utils.js";

export class PlaywrightAdapter extends BaseAdapter {
  constructor() {
    super("playwright");
  }

  async isAvailable(): Promise<boolean> {
    const hasNpm = await checkNpmToolAvailable("playwright");
    if (!hasNpm) return false;
    const hasBrowser = await checkBinaryAvailable("chromium") || await checkBinaryAvailable("google-chrome");
    return hasBrowser;
  }

  protected getInstallHint(): string {
    return "Install Playwright: npm install --save-dev playwright && npx playwright install chromium";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "not_available",
      message: "Playwright adapter requires test scripts to be configured. No test suite found.",
      score: 0,
      durationMs: 0,
      evidence: {
        adapter: this.id,
        reason: "no_test_scripts",
        note: "Configure Playwright test scripts in tools/playwright/ to enable functional testing",
      },
    };
  }
}
