import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkBinaryAvailable } from "./adapter-utils.js";

export class ZapAdapter extends BaseAdapter {
  constructor() {
    super("zap");
  }

  async isAvailable(): Promise<boolean> {
    const hasDocker = await checkBinaryAvailable("docker");
    return hasDocker;
  }

  protected getInstallHint(): string {
    return "Install OWASP ZAP via Docker: docker pull owasp/zap2docker-stable";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    return {
      testId: test.id,
      toolId: this.toolId,
      status: "not_available",
      message: "ZAP requires Docker runtime which is not available in this environment",
      score: 0,
      durationMs: 0,
      evidence: {
        adapter: this.id,
        reason: "docker_not_available",
        installHint: this.getInstallHint(),
      },
    };
  }
}
