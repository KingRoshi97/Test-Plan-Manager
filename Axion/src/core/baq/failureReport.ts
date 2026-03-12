import * as fs from "fs";
import * as path from "path";
import type {
  BAQGenerationFailureReport,
  BAQFailureEntry,
  BAQSeverity,
  GenerationFailureClass,
} from "./types.js";

export interface FailureInput {
  failureClass: GenerationFailureClass;
  severity: BAQSeverity;
  phase: string;
  description: string;
  sourceRef?: string;
  fileRef?: string;
}

export function createFailureEntry(input: FailureInput): BAQFailureEntry {
  const now = new Date().toISOString();
  return {
    failure_id: `FAIL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    failure_class: input.failureClass,
    severity: input.severity,
    phase: input.phase,
    description: input.description,
    source_ref: input.sourceRef ?? null,
    file_ref: input.fileRef ?? null,
    resolution: null,
    resolved: false,
    created_at: now,
  };
}

const ALL_FAILURE_CLASSES: GenerationFailureClass[] = [
  "extraction_failure",
  "planning_failure",
  "inventory_failure",
  "traceability_failure",
  "generation_failure",
  "placeholder_fulfillment_failure",
  "verification_failure",
  "packaging_failure",
];

const ALL_SEVERITIES: BAQSeverity[] = ["info", "warning", "error", "critical"];

function buildSummaryCounts(
  failures: BAQFailureEntry[],
): BAQGenerationFailureReport["summary"] {
  const byClass: Record<GenerationFailureClass, number> = {} as any;
  for (const cls of ALL_FAILURE_CLASSES) {
    byClass[cls] = 0;
  }
  const bySeverity: Record<BAQSeverity, number> = {} as any;
  for (const sev of ALL_SEVERITIES) {
    bySeverity[sev] = 0;
  }

  let resolvedCount = 0;
  let unresolvedCount = 0;
  let blockingCount = 0;

  for (const f of failures) {
    byClass[f.failure_class] = (byClass[f.failure_class] ?? 0) + 1;
    bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
    if (f.resolved) {
      resolvedCount++;
    } else {
      unresolvedCount++;
    }
    if (f.severity === "error" || f.severity === "critical") {
      if (!f.resolved) blockingCount++;
    }
  }

  return {
    total_failures: failures.length,
    by_class: byClass,
    by_severity: bySeverity,
    resolved_count: resolvedCount,
    unresolved_count: unresolvedCount,
    blocking_count: blockingCount,
  };
}

export function buildFailureReport(
  runId: string,
  buildId: string,
  failures: BAQFailureEntry[],
): BAQGenerationFailureReport {
  const now = new Date().toISOString();
  return {
    schema_version: "1.0.0",
    report_id: `GFR-${buildId}`,
    run_id: runId,
    build_id: buildId,
    failures,
    summary: buildSummaryCounts(failures),
    created_at: now,
    updated_at: now,
  };
}

export function writeFailureReport(
  runDir: string,
  report: BAQGenerationFailureReport,
): string {
  const reportPath = path.join(runDir, "generation_failure_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  return reportPath;
}

export class FailureCollector {
  private entries: BAQFailureEntry[] = [];

  add(input: FailureInput): void {
    this.entries.push(createFailureEntry(input));
  }

  addFromError(
    phase: string,
    failureClass: GenerationFailureClass,
    error: string,
    severity: BAQSeverity = "error",
  ): void {
    this.add({
      failureClass,
      severity,
      phase,
      description: error,
    });
  }

  getEntries(): BAQFailureEntry[] {
    return [...this.entries];
  }

  hasBlockingFailures(): boolean {
    return this.entries.some(
      f => (f.severity === "error" || f.severity === "critical") && !f.resolved,
    );
  }

  count(): number {
    return this.entries.length;
  }

  finalize(runId: string, buildId: string): BAQGenerationFailureReport {
    return buildFailureReport(runId, buildId, this.entries);
  }
}
