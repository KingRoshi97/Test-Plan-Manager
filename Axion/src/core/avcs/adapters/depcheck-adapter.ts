import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkBinaryAvailable, spawnTool } from "./adapter-utils.js";

export class DepCheckAdapter extends BaseAdapter {
  constructor() {
    super("dependency-check");
  }

  async isAvailable(): Promise<boolean> {
    return checkBinaryAvailable("dependency-check");
  }

  protected getInstallHint(): string {
    return "Install OWASP Dependency-Check: download from https://github.com/jeremylong/DependencyCheck or use Docker";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const targetDir = context.targetDir || context.buildDir;
    const timeoutMs = (context.timeoutSeconds || 300) * 1000;

    const result = await spawnTool(
      "dependency-check",
      ["--scan", targetDir, "--format", "JSON", "--out", "/tmp/depcheck-output"],
      { timeoutMs, cwd: targetDir }
    );

    if (result.timedOut) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: "Dependency-Check scan timed out",
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, timedOut: true },
      };
    }

    return {
      testId: test.id,
      toolId: this.toolId,
      status: result.exitCode === 0 ? "pass" : "warn",
      message: `Dependency-Check completed (exit code ${result.exitCode})`,
      score: result.exitCode === 0 ? 100 : 50,
      durationMs: result.durationMs,
      evidence: { adapter: this.id, exitCode: result.exitCode },
    };
  }
}
