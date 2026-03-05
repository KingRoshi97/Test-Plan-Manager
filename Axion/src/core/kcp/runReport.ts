import { isoNow } from "../../utils/time.js";
import type { KitRun, KitRunReport, VerificationResult } from "./model.js";

export function buildKitRunReport(run: KitRun): KitRunReport {
  const unitsSummary = {
    total: run.units.length,
    done: run.units.filter((u) => u.status === "done").length,
    failed: run.units.filter((u) => u.status === "failed").length,
    skipped: run.units.filter((u) => u.status === "skipped").length,
  };

  const allVerificationResults: VerificationResult[] = [
    ...run.verification_results,
  ];
  for (const unit of run.units) {
    allVerificationResults.push(...unit.verification_results);
  }

  return {
    kit_run_id: run.kit_run_id,
    kit_manifest_ref: run.kit_manifest_ref,
    status: run.status,
    units_summary: unitsSummary,
    verification_results: allVerificationResults,
    guardrail_report_ref: run.guardrail_report_ref,
    created_at: run.created_at,
    completed_at: run.status === "complete" ? isoNow() : null,
  };
}

export function isKitRunMergeable(report: KitRunReport): boolean {
  return (
    report.status === "complete" &&
    report.units_summary.failed === 0 &&
    report.units_summary.done > 0
  );
}
