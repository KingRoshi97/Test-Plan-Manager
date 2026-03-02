import { join } from "node:path";
import { readJson, writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { loadGateRegistry, filterGatesByStage, templateGatePaths } from "./registry.js";
import { evalCheck } from "./evaluator.js";
import { writeGateReport } from "./report.js";
import type { GateReportV1, CheckReport } from "./report.js";
import type { RunManifest } from "../../types/run.js";

export interface GateRunResult {
  reports: GateReportV1[];
  all_passed: boolean;
}

const ENGINE = { name: "axion-gates", version: "0.1.0" };

export function runGatesForStage(baseDir: string, runId: string, stageId: string): GateRunResult {
  const registryPath = join(baseDir, "registries", "GATE_REGISTRY.json");
  const allGates = loadGateRegistry(registryPath);
  const stageGates = filterGatesByStage(allGates, stageId);

  if (stageGates.length === 0) {
    console.log(`  No gates defined for stage ${stageId}`);
    return { reports: [], all_passed: true };
  }

  const runDir = join(baseDir, ".axion", "runs", runId);
  const manifestPath = join(runDir, "run_manifest.json");
  const manifest = readJson<RunManifest>(manifestPath);

  const reports: GateReportV1[] = [];

  for (const rawGate of stageGates) {
    const gate = templateGatePaths(rawGate, runId);
    const checkReports: CheckReport[] = [];
    let gatePassed = true;
    let firstFailureCode: string | null = null;
    let failEvidence: GateReportV1["evidence"] = [];

    for (const check of gate.checks) {
      const result = evalCheck(check);
      const cr: CheckReport = {
        check_id: check.op,
        status: result.pass ? "pass" : "fail",
        failure_code: result.failure_code,
        evidence: result.evidence,
      };
      checkReports.push(cr);

      if (!result.pass) {
        gatePassed = false;
        firstFailureCode = result.failure_code;
        failEvidence = result.evidence;
        break;
      }
    }

    const report: GateReportV1 = {
      run_id: runId,
      gate_id: gate.gate_id,
      stage_id: gate.stage_id,
      status: gatePassed ? "pass" : "fail",
      evaluated_at: isoNow(),
      engine: ENGINE,
      checks: checkReports,
      failure_codes: gatePassed ? [] : (firstFailureCode ? [firstFailureCode] : []),
      evidence: gatePassed ? [] : failEvidence,
    };

    const reportPath = join(runDir, "gates", `${gate.gate_id}.gate_report.json`);
    writeGateReport(reportPath, report);
    reports.push(report);

    manifest.gate_reports.push({
      gate_id: gate.gate_id,
      path: `gates/${gate.gate_id}.gate_report.json`,
      verdict: report.status,
    });

    if (!gatePassed) {
      manifest.status = "failed";
      manifest.updated_at = isoNow();
      writeJson(manifestPath, manifest);

      console.log(`  FAIL ${gate.gate_id}: ${firstFailureCode}`);
      return { reports, all_passed: false };
    }

    console.log(`  PASS ${gate.gate_id}`);
  }

  manifest.updated_at = isoNow();
  writeJson(manifestPath, manifest);

  return { reports, all_passed: true };
}
