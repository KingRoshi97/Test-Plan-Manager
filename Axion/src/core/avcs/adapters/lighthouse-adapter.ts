import type { AVCSTestDefinition, AVCSTestResult, ToolAdapterContext } from "../types.js";
import { BaseAdapter } from "./base-adapter.js";
import { checkNpmToolAvailable, checkBinaryAvailable, spawnTool, parseJsonSafe } from "./adapter-utils.js";

interface LighthouseReport {
  categories?: {
    performance?: { score: number };
    accessibility?: { score: number };
    "best-practices"?: { score: number };
    seo?: { score: number };
  };
  audits?: Record<string, {
    id: string;
    title: string;
    score: number | null;
    numericValue?: number;
    displayValue?: string;
  }>;
}

export class LighthouseAdapter extends BaseAdapter {
  constructor() {
    super("lighthouse");
  }

  async isAvailable(): Promise<boolean> {
    const hasNpm = await checkNpmToolAvailable("lighthouse");
    if (!hasNpm) return false;
    const hasChrome = await checkBinaryAvailable("chromium") || await checkBinaryAvailable("google-chrome") || await checkBinaryAvailable("chrome");
    return hasChrome;
  }

  protected getInstallHint(): string {
    return "Install lighthouse: npm install --save-dev lighthouse (requires Chrome/Chromium)";
  }

  async runTool(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult> {
    const targetUrl = `http://localhost:${process.env.PORT || 5000}`;
    const timeoutMs = (context.timeoutSeconds || 60) * 1000;

    const result = await spawnTool(
      "npx",
      [
        "lighthouse",
        targetUrl,
        "--output=json",
        "--output-path=stdout",
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--only-categories=performance,accessibility,best-practices",
        "--quiet",
      ],
      { timeoutMs, cwd: context.buildDir }
    );

    if (result.timedOut) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: "Lighthouse audit timed out",
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, timedOut: true },
      };
    }

    const report = parseJsonSafe<LighthouseReport>(result.stdout);

    if (!report?.categories) {
      return {
        testId: test.id,
        toolId: this.toolId,
        status: "error",
        message: `Lighthouse failed to produce results (exit code ${result.exitCode})`,
        score: 0,
        durationMs: result.durationMs,
        evidence: { adapter: this.id, stderr: result.stderr.slice(0, 2000) },
      };
    }

    const perfScore = Math.round((report.categories.performance?.score ?? 0) * 100);
    const a11yScore = Math.round((report.categories.accessibility?.score ?? 0) * 100);
    const bpScore = Math.round((report.categories["best-practices"]?.score ?? 0) * 100);

    const fcp = report.audits?.["first-contentful-paint"]?.numericValue;
    const lcp = report.audits?.["largest-contentful-paint"]?.numericValue;
    const si = report.audits?.["speed-index"]?.numericValue;

    const testDomain = test.domain;
    let score: number;
    if (testDomain === "ACCESSIBILITY") {
      score = a11yScore;
    } else {
      score = perfScore;
    }

    const findings = [];
    if (perfScore < 50) {
      findings.push({
        severity: "high" as const,
        title: "Poor performance score",
        description: `Lighthouse performance score: ${perfScore}/100`,
      });
    }
    if (a11yScore < 50) {
      findings.push({
        severity: "high" as const,
        title: "Poor accessibility score",
        description: `Lighthouse accessibility score: ${a11yScore}/100`,
      });
    }

    return {
      testId: test.id,
      toolId: this.toolId,
      status: score >= 70 ? "pass" : score >= 50 ? "warn" : "fail",
      message: `Lighthouse: perf=${perfScore}, a11y=${a11yScore}, best-practices=${bpScore}`,
      score,
      durationMs: result.durationMs,
      evidence: {
        adapter: this.id,
        performance: perfScore,
        accessibility: a11yScore,
        bestPractices: bpScore,
        ...(fcp != null ? { firstContentfulPaint: Math.round(fcp) } : {}),
        ...(lcp != null ? { largestContentfulPaint: Math.round(lcp) } : {}),
        ...(si != null ? { speedIndex: Math.round(si) } : {}),
      },
      findings: findings.length > 0 ? findings : undefined,
    };
  }
}
