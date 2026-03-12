import * as fs from "fs";
import * as path from "path";
import type {
  BAQGenerationFailureReport,
  BAQFailureEntry,
  BAQSeverity,
  GenerationFailureClass,
} from "./types.js";

export type RetryClassification =
  | "safe_retry"
  | "repair_then_retry"
  | "manual_review_required"
  | "do_not_retry";

export interface FailureInput {
  failureClass: GenerationFailureClass;
  severity: BAQSeverity;
  phase: string;
  description: string;
  sourceRef?: string;
  fileRef?: string;
  failingUnit?: string;
  expectedArtifacts?: string[];
  producedArtifacts?: string[];
  missingArtifacts?: string[];
  retryClassification?: RetryClassification;
  upstreamBlockers?: string[];
  repairHints?: string[];
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

export interface ExtendedFailureEntry extends BAQFailureEntry {
  failing_unit: string | null;
  expected_artifacts: string[];
  produced_artifacts: string[];
  missing_artifacts: string[];
  retry_classification: RetryClassification;
  upstream_blockers: string[];
  repair_hints: string[];
}

export function createExtendedFailureEntry(input: FailureInput): ExtendedFailureEntry {
  const base = createFailureEntry(input);
  return {
    ...base,
    failing_unit: input.failingUnit ?? null,
    expected_artifacts: input.expectedArtifacts ?? [],
    produced_artifacts: input.producedArtifacts ?? [],
    missing_artifacts: input.missingArtifacts ?? [],
    retry_classification: input.retryClassification ?? "manual_review_required",
    upstream_blockers: input.upstreamBlockers ?? [],
    repair_hints: input.repairHints ?? [],
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

function initByClass(): Record<GenerationFailureClass, number> {
  const result: Partial<Record<GenerationFailureClass, number>> = {};
  for (const cls of ALL_FAILURE_CLASSES) {
    result[cls] = 0;
  }
  return result as Record<GenerationFailureClass, number>;
}

function initBySeverity(): Record<BAQSeverity, number> {
  const result: Partial<Record<BAQSeverity, number>> = {};
  for (const sev of ALL_SEVERITIES) {
    result[sev] = 0;
  }
  return result as Record<BAQSeverity, number>;
}

function buildSummaryCounts(
  failures: BAQFailureEntry[],
): BAQGenerationFailureReport["summary"] {
  const byClass = initByClass();
  const bySeverity = initBySeverity();

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

export interface RetryRecommendation {
  classification: RetryClassification;
  safe_retry_count: number;
  repair_then_retry_count: number;
  manual_review_count: number;
  do_not_retry_count: number;
}

export interface ExtendedFailureReport extends BAQGenerationFailureReport {
  failing_units: string[];
  expected_artifacts: string[];
  produced_artifacts: string[];
  missing_artifacts: string[];
  upstream_blockers: string[];
  retry_recommendation: RetryRecommendation;
  repair_hints: string[];
}

export function buildFailureReport(
  runId: string,
  buildId: string,
  failures: BAQFailureEntry[],
  extendedEntries: ExtendedFailureEntry[] = [],
): ExtendedFailureReport {
  const now = new Date().toISOString();

  const failingUnits = new Set<string>();
  const expectedArtifacts = new Set<string>();
  const producedArtifacts = new Set<string>();
  const missingArtifacts = new Set<string>();
  const upstreamBlockers = new Set<string>();
  const repairHints: string[] = [];
  let safeRetryCount = 0;
  let repairThenRetryCount = 0;
  let manualReviewCount = 0;
  let doNotRetryCount = 0;

  for (const ext of extendedEntries) {
    if (ext.failing_unit) failingUnits.add(ext.failing_unit);
    for (const a of ext.expected_artifacts) expectedArtifacts.add(a);
    for (const a of ext.produced_artifacts) producedArtifacts.add(a);
    for (const a of ext.missing_artifacts) missingArtifacts.add(a);
    for (const b of ext.upstream_blockers) upstreamBlockers.add(b);
    switch (ext.retry_classification) {
      case "safe_retry": safeRetryCount++; break;
      case "repair_then_retry": repairThenRetryCount++; break;
      case "manual_review_required": manualReviewCount++; break;
      case "do_not_retry": doNotRetryCount++; break;
    }
    for (const h of ext.repair_hints) {
      if (!repairHints.includes(h)) repairHints.push(h);
    }
  }

  let overallClassification: RetryClassification = "safe_retry";
  if (doNotRetryCount > 0) overallClassification = "do_not_retry";
  else if (manualReviewCount > 0) overallClassification = "manual_review_required";
  else if (repairThenRetryCount > 0) overallClassification = "repair_then_retry";

  return {
    schema_version: "1.0.0",
    report_id: `GFR-${buildId}`,
    run_id: runId,
    build_id: buildId,
    failures,
    summary: buildSummaryCounts(failures),
    failing_units: Array.from(failingUnits),
    expected_artifacts: Array.from(expectedArtifacts),
    produced_artifacts: Array.from(producedArtifacts),
    missing_artifacts: Array.from(missingArtifacts),
    upstream_blockers: Array.from(upstreamBlockers),
    retry_recommendation: {
      classification: overallClassification,
      safe_retry_count: safeRetryCount,
      repair_then_retry_count: repairThenRetryCount,
      manual_review_count: manualReviewCount,
      do_not_retry_count: doNotRetryCount,
    },
    repair_hints: repairHints,
    created_at: now,
    updated_at: now,
  };
}

export function writeFailureReport(
  runDir: string,
  report: ExtendedFailureReport,
): string {
  const reportPath = path.join(runDir, "generation_failure_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  return reportPath;
}

export class FailureCollector {
  private entries: BAQFailureEntry[] = [];
  private extendedEntries: ExtendedFailureEntry[] = [];

  add(input: FailureInput): void {
    const extended = createExtendedFailureEntry(input);
    this.entries.push(extended);
    this.extendedEntries.push(extended);
  }

  addFromError(
    phase: string,
    failureClass: GenerationFailureClass,
    error: string,
    severity: BAQSeverity = "error",
    opts: {
      failingUnit?: string;
      expectedArtifacts?: string[];
      producedArtifacts?: string[];
      missingArtifacts?: string[];
      retryClassification?: RetryClassification;
      upstreamBlockers?: string[];
      repairHints?: string[];
    } = {},
  ): void {
    this.add({
      failureClass,
      severity,
      phase,
      description: error,
      ...opts,
    });
  }

  getEntries(): BAQFailureEntry[] {
    return [...this.entries];
  }

  getExtendedEntries(): ExtendedFailureEntry[] {
    return [...this.extendedEntries];
  }

  hasBlockingFailures(): boolean {
    return this.entries.some(
      f => (f.severity === "error" || f.severity === "critical") && !f.resolved,
    );
  }

  count(): number {
    return this.entries.length;
  }

  finalize(runId: string, buildId: string): ExtendedFailureReport {
    return buildFailureReport(runId, buildId, this.entries, this.extendedEntries);
  }
}
