import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkBinaryAvailable, spawnTool, parseJsonSafe, mapSeverity } from "./adapter-utils.js";

interface TrivyVulnerability {
  VulnerabilityID: string;
  PkgName: string;
  InstalledVersion: string;
  FixedVersion?: string;
  Severity: string;
  Title?: string;
  Description?: string;
}

interface TrivyResult {
  Results?: Array<{
    Target: string;
    Type: string;
    Vulnerabilities?: TrivyVulnerability[];
  }>;
}

export class TrivyAdapter extends BaseAdapter {
  constructor() {
    super("trivy");
  }

  async isAvailable(): Promise<boolean> {
    return checkBinaryAvailable("trivy");
  }

  protected getInstallHint(): string {
    return "Install Trivy: curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh or use Docker: docker run aquasec/trivy";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const targetDir = context.targetDir || context.buildDir;
    const timeoutMs = (context.timeoutSeconds || 120) * 1000;

    const scanType = test.id === "SEC-02" ? "fs" : "fs";
    const scanners = test.id === "SEC-02" ? "secret" : "vuln";

    const result = await spawnTool(
      "trivy",
      [scanType, "--format", "json", "--scanners", scanners, targetDir],
      { timeoutMs, cwd: targetDir }
    );

    if (result.timedOut) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: "Trivy scan timed out",
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, timedOut: true },
      };
    }

    const parsed = parseJsonSafe<TrivyResult>(result.stdout);
    if (!parsed) {
      if (result.exitCode === 0) {
        return {
          testId: test.id,
          toolId: this.toolId,
          status: "pass",
          message: "Trivy scan completed — no issues found",
          score: 100,
          durationMs: result.durationMs,
          evidence: { adapter: this.id },
        };
      }
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: `Trivy exited with code ${result.exitCode}`,
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, stderr: result.stderr.slice(0, 2000) },
      };
    }

    const allVulns = (parsed.Results || []).flatMap(r => r.Vulnerabilities || []);
    const findings = allVulns.slice(0, 50).map(v => ({
      severity: mapSeverity(v.Severity),
      title: `${v.VulnerabilityID}: ${v.PkgName}@${v.InstalledVersion}`,
      description: v.Title || v.Description || `Vulnerability in ${v.PkgName}`,
      affectedFiles: [`${v.PkgName}@${v.InstalledVersion}`],
    }));

    const criticalCount = allVulns.filter(v => v.Severity === "CRITICAL" || v.Severity === "HIGH").length;
    let score = 100;
    if (criticalCount > 0) score = Math.max(0, 100 - criticalCount * 15);
    else if (allVulns.length > 0) score = Math.max(50, 100 - allVulns.length * 3);

    return {
      testId: test.id,
      toolId: this.toolId,
      status: criticalCount > 0 ? "fail" : allVulns.length > 0 ? "warn" : "pass",
      message: allVulns.length === 0
        ? "Trivy scan clean — no vulnerabilities"
        : `Trivy found ${allVulns.length} vulnerability(ies) (${criticalCount} critical/high)`,
      score,
      durationMs: result.durationMs,
      evidence: {
        adapter: this.id,
        totalVulnerabilities: allVulns.length,
        criticalHigh: criticalCount,
        bySeverity: allVulns.reduce((acc, v) => {
          acc[v.Severity] = (acc[v.Severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      findings: findings.length > 0 ? findings : undefined,
    };
  }
}
