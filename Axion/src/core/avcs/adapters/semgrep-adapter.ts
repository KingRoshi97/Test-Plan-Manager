import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkBinaryAvailable, spawnTool, parseJsonSafe, mapSeverity } from "./adapter-utils.js";

interface SemgrepResult {
  results?: Array<{
    check_id: string;
    path: string;
    start: { line: number; col: number };
    end: { line: number; col: number };
    extra: {
      message: string;
      severity: string;
      metadata?: Record<string, unknown>;
      lines?: string;
    };
  }>;
  errors?: Array<{ message: string }>;
}

export class SemgrepAdapter extends BaseAdapter {
  constructor() {
    super("semgrep");
  }

  async isAvailable(): Promise<boolean> {
    return checkBinaryAvailable("semgrep");
  }

  protected getInstallHint(): string {
    return "Install semgrep: pip install semgrep or brew install semgrep";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const targetDir = context.targetDir || context.buildDir;
    const timeoutMs = (context.timeoutSeconds || 120) * 1000;

    const result = await spawnTool(
      "semgrep",
      [
        "scan",
        "--config", "auto",
        "--json",
        "--timeout", String(Math.floor(timeoutMs / 1000)),
        "--max-target-bytes", "1000000",
        targetDir,
      ],
      { timeoutMs, cwd: targetDir }
    );

    if (result.timedOut) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: "Semgrep scan timed out",
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, timedOut: true },
      };
    }

    const parsed = parseJsonSafe<SemgrepResult>(result.stdout);

    if (!parsed) {
      if (result.exitCode === 0) {
        return {
          testId: test.id,
          toolId: this.toolId,
          status: "pass",
          message: "Semgrep scan completed — no findings",
          score: 100,
          durationMs: result.durationMs,
          evidence: { adapter: this.id, rawOutput: result.stdout.slice(0, 2000) },
        };
      }
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: `Semgrep exited with code ${result.exitCode}`,
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, stderr: result.stderr.slice(0, 2000) },
      };
    }

    const findings = (parsed.results || []).map((r) => ({
      severity: mapSeverity(r.extra.severity),
      title: r.check_id,
      description: r.extra.message,
      affectedFiles: [r.path],
    }));

    const criticalCount = findings.filter(f => f.severity === "high" || f.severity === "critical").length;
    const totalCount = findings.length;

    let score = 100;
    if (criticalCount > 0) score = Math.max(0, 100 - criticalCount * 20);
    else if (totalCount > 0) score = Math.max(40, 100 - totalCount * 5);

    return {
      testId: test.id,
      toolId: this.toolId,
      status: criticalCount > 0 ? "fail" : totalCount > 0 ? "warn" : "pass",
      message: totalCount === 0
        ? "Semgrep scan clean — no issues found"
        : `Semgrep found ${totalCount} issue(s) (${criticalCount} high/critical)`,
      score,
      durationMs: result.durationMs,
      evidence: {
        adapter: this.id,
        totalFindings: totalCount,
        criticalFindings: criticalCount,
        findingsByRule: findings.reduce((acc, f) => {
          acc[f.title] = (acc[f.title] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      findings,
    };
  }
}
