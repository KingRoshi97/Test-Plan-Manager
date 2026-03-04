import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { readJson, writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { loadGateRegistry, filterGatesByStage, templateGatePaths, isNonOverridable } from "./registry.js";
import { evalCheck, resolveEvidencePointer } from "./evaluator.js";
import { writeGateReport } from "./report.js";
import type { GateReportV1, CheckReport } from "./report.js";
import type { GateDefinition } from "./registry.js";
import type { RunManifest } from "../../types/run.js";

export interface GateRunResult {
  reports: GateReportV1[];
  all_passed: boolean;
}

const ENGINE = { name: "axion-gates", version: "0.2.0" };

function checkRequiredProofTypes(gate: GateDefinition, runDir: string): { pass: boolean; missing: string[] } {
  const required = gate.required_proof_types;
  if (!required || required.length === 0) {
    return { pass: true, missing: [] };
  }

  const ledgerPath = join(runDir, "proof_ledger", "ledger.jsonl");
  if (!existsSync(ledgerPath)) {
    return { pass: false, missing: [...required] };
  }

  let ledgerContent: string;
  try {
    ledgerContent = readFileSync(ledgerPath, "utf-8");
  } catch {
    return { pass: false, missing: [...required] };
  }

  const proofTypes = new Set<string>();
  for (const line of ledgerContent.split("\n")) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (entry.proof_type) {
        proofTypes.add(entry.proof_type);
      }
    } catch {
      continue;
    }
  }

  const missing = required.filter((pt) => !proofTypes.has(pt));
  return { pass: missing.length === 0, missing };
}

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
      const result = evalCheck(check, gate.gate_id);
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

    if (gatePassed) {
      const proofCheck = checkRequiredProofTypes(rawGate, runDir);
      if (!proofCheck.pass) {
        gatePassed = false;
        firstFailureCode = "E_MISSING_REQUIRED_PROOF_TYPES";
        failEvidence = [{
          path: "",
          pointer: "",
          details: {
            gate_id: gate.gate_id,
            missing_proof_types: proofCheck.missing,
            required_proof_types: rawGate.required_proof_types,
          },
        }];
        checkReports.push({
          check_id: "required_proof_types",
          status: "fail",
          failure_code: "E_MISSING_REQUIRED_PROOF_TYPES",
          evidence: failEvidence,
        });
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
