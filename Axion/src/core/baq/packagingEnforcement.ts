import * as fs from "fs";
import * as path from "path";
import type {
  BAQRepoInventory,
  BAQBuildQualityReport,
  BuildQualityGateId,
} from "./types.js";
import type { ExtendedBuildQualityReport } from "./qualityReport.js";

export interface ManifestTargetMismatch {
  file_path: string;
  expected: boolean;
  actual_exists: boolean;
  reason: string;
}

export interface PackagingPreflightCheck {
  artifact_name: string;
  path: string;
  exists: boolean;
  required: boolean;
}

export interface PackagingPreflightDecision {
  allowed: boolean;
  block_reasons: string[];
  gate_evidence: GateEvidenceLink[];
  manifest_mismatches: ManifestTargetMismatch[];
  artifact_checks: PackagingPreflightCheck[];
  evaluated_at: string;
}

export interface GateEvidenceLink {
  gate_id: string;
  gate_name: string;
  status: string;
  blockers: string[];
}

const PACKAGE_CRITICAL_ARTIFACTS = [
  { name: "kit_extraction", file: "kit_extraction.json", required: true },
  { name: "derived_build_inputs", file: "derived_build_inputs.json", required: true },
  { name: "repo_inventory", file: "repo_inventory.json", required: true },
  { name: "requirement_trace_map", file: "requirement_trace_map.json", required: true },
  { name: "sufficiency_evaluation", file: "sufficiency_evaluation.json", required: true },
  { name: "build_quality_report", file: "build_quality_report.json", required: true },
];

function checkPackageCriticalArtifacts(runDir: string): PackagingPreflightCheck[] {
  return PACKAGE_CRITICAL_ARTIFACTS.map(artifact => {
    const filePath = path.join(runDir, artifact.file);
    return {
      artifact_name: artifact.name,
      path: filePath,
      exists: fs.existsSync(filePath),
      required: artifact.required,
    };
  });
}

function loadQualityReport(runDir: string): ExtendedBuildQualityReport | null {
  const reportPath = path.join(runDir, "build_quality_report.json");
  if (!fs.existsSync(reportPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  } catch {
    return null;
  }
}

function loadInventory(runDir: string): BAQRepoInventory | null {
  const inventoryPath = path.join(runDir, "repo_inventory.json");
  if (!fs.existsSync(inventoryPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(inventoryPath, "utf-8"));
  } catch {
    return null;
  }
}

function reconcileManifestTargets(
  runDir: string,
  inventory: BAQRepoInventory | null,
  kitBundleDir: string,
): ManifestTargetMismatch[] {
  const mismatches: ManifestTargetMismatch[] = [];

  if (!inventory) {
    mismatches.push({
      file_path: "repo_inventory.json",
      expected: true,
      actual_exists: false,
      reason: "Repo inventory not available for manifest reconciliation",
    });
    return mismatches;
  }

  const files = Array.isArray(inventory.files) ? inventory.files : [];
  for (const file of files) {
    if (!file.required) continue;
    const bundlePath = path.join(kitBundleDir, file.path);
    const exists = fs.existsSync(bundlePath);
    if (!exists) {
      mismatches.push({
        file_path: file.path,
        expected: true,
        actual_exists: false,
        reason: `Required file from inventory missing in kit bundle: ${file.path}`,
      });
    }
  }

  return mismatches;
}

function extractGateEvidence(report: ExtendedBuildQualityReport): GateEvidenceLink[] {
  return report.gates.map(gate => ({
    gate_id: gate.gate_id,
    gate_name: gate.gate_name,
    status: gate.status,
    blockers: gate.blockers,
  }));
}

export function runPackagingPreflight(
  runDir: string,
  kitBundleDir: string,
): PackagingPreflightDecision {
  const blockReasons: string[] = [];

  const artifactChecks = checkPackageCriticalArtifacts(runDir);
  const missingArtifacts = artifactChecks.filter(c => c.required && !c.exists);
  if (missingArtifacts.length > 0) {
    const names = missingArtifacts.map(a => a.artifact_name);
    blockReasons.push(`Missing package-critical artifacts: ${names.join(", ")}`);
  }

  const qualityReport = loadQualityReport(runDir);
  let gateEvidence: GateEvidenceLink[] = [];

  if (!qualityReport) {
    blockReasons.push("Build quality report not found — cannot verify gate state");
  } else {
    gateEvidence = extractGateEvidence(qualityReport);

    const failedGates = qualityReport.gates.filter(g => g.status === "fail");
    if (failedGates.length > 0) {
      const failedIds = failedGates.map(g => `${g.gate_id} (${g.gate_name})`);
      blockReasons.push(`Hard gate(s) failed: ${failedIds.join(", ")}`);
    }

    if (qualityReport.decision === "blocked" || qualityReport.decision === "failed") {
      blockReasons.push(`Build quality decision is "${qualityReport.decision}"`);
    }

    if ("packaging_eligibility" in qualityReport && !qualityReport.packaging_eligibility.eligible) {
      blockReasons.push("Packaging eligibility check failed in quality report");
    }
  }

  const inventory = loadInventory(runDir);
  const manifestMismatches = reconcileManifestTargets(runDir, inventory, kitBundleDir);
  if (manifestMismatches.length > 0) {
    blockReasons.push(`Manifest target mismatches: ${manifestMismatches.length} file(s) missing from kit bundle`);
  }

  const proofPath = path.join(runDir, "proof", "proof_ledger.jsonl");
  if (!fs.existsSync(proofPath)) {
    blockReasons.push("Proof ledger missing — no verification proof available");
  }

  const tracePath = path.join(runDir, "requirement_trace_map.json");
  if (!fs.existsSync(tracePath)) {
    blockReasons.push("Requirement trace map missing — traceability not established");
  }

  return {
    allowed: blockReasons.length === 0,
    block_reasons: blockReasons,
    gate_evidence: gateEvidence,
    manifest_mismatches: manifestMismatches,
    artifact_checks: artifactChecks,
    evaluated_at: new Date().toISOString(),
  };
}

export function writePackagingDecision(
  runDir: string,
  decision: PackagingPreflightDecision,
): string {
  const decisionPath = path.join(runDir, "packaging_decision.json");
  fs.writeFileSync(decisionPath, JSON.stringify(decision, null, 2), "utf-8");
  return decisionPath;
}
