import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkNpmToolAvailable, spawnTool, parseJsonSafe, mapSeverity } from "./adapter-utils.js";

interface AxeViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

interface AxeCliResult {
  violations?: AxeViolation[];
  passes?: Array<{ id: string }>;
  incomplete?: Array<{ id: string }>;
  inapplicable?: Array<{ id: string }>;
}

export class AxeAdapter extends BaseAdapter {
  constructor() {
    super("axe");
  }

  async isAvailable(): Promise<boolean> {
    return checkNpmToolAvailable("axe");
  }

  protected getInstallHint(): string {
    return "Install axe-core CLI: npm install --save-dev @axe-core/cli";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const targetUrl = `http://localhost:${process.env.PORT || 5000}`;
    const timeoutMs = (context.timeoutSeconds || 60) * 1000;

    const result = await spawnTool(
      "npx",
      ["axe", targetUrl, "--reporter", "json"],
      { timeoutMs, cwd: context.buildDir }
    );

    if (result.timedOut) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: "axe-core scan timed out",
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, timedOut: true },
      };
    }

    const parsed = parseJsonSafe<AxeCliResult[]>(result.stdout);
    const axeResult = Array.isArray(parsed) ? parsed[0] : parseJsonSafe<AxeCliResult>(result.stdout);

    if (!axeResult) {
      if (result.exitCode === 0) {
        return {
          testId: test.id,
          toolId: this.toolId,
          status: "pass",
          message: "axe-core scan completed — no violations",
          score: 100,
          durationMs: result.durationMs,
          evidence: { adapter: this.id },
        };
      }
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: `axe-core failed (exit ${result.exitCode})`,
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, stderr: result.stderr.slice(0, 2000) },
      };
    }

    const violations = axeResult.violations || [];
    const findings = violations.map((v) => ({
      severity: mapSeverity(v.impact),
      title: `${v.id}: ${v.help}`,
      description: v.description,
      affectedFiles: v.nodes.map(n => n.target.join(" > ")).slice(0, 5),
    }));

    const criticalCount = violations.filter(v => v.impact === "critical" || v.impact === "serious").length;
    const totalViolations = violations.length;
    const passCount = axeResult.passes?.length ?? 0;
    const totalChecks = passCount + totalViolations;
    const score = totalChecks > 0 ? Math.round((passCount / totalChecks) * 100) : 100;

    return {
      testId: test.id,
      toolId: this.toolId,
      status: criticalCount > 0 ? "fail" : totalViolations > 0 ? "warn" : "pass",
      message: totalViolations === 0
        ? `axe-core: all ${passCount} checks passed`
        : `axe-core: ${totalViolations} violation(s), ${passCount} passed (${criticalCount} critical/serious)`,
      score,
      durationMs: result.durationMs,
      evidence: {
        adapter: this.id,
        violations: totalViolations,
        passes: passCount,
        criticalViolations: criticalCount,
        wcagTags: [...new Set(violations.flatMap(v => v.tags.filter(t => t.startsWith("wcag"))))],
      },
      findings: findings.length > 0 ? findings : undefined,
    };
  }
}
