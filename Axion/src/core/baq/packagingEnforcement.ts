import * as fs from "fs";
import * as path from "path";

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

const KIT_CONTRACT_ARTIFACTS = [
  { name: "kit_manifest", file: "kit/kit_manifest.json", required: true },
  { name: "packaging_manifest", file: "kit/packaging_manifest.json", required: true },
  { name: "version_stamp", file: "kit/version_stamp.json", required: false },
  { name: "kit_validation_report", file: "kit/kit_validation_report.json", required: true },
];

function checkKitContractArtifacts(runDir: string): PackagingPreflightCheck[] {
  return KIT_CONTRACT_ARTIFACTS.map(artifact => {
    const filePath = path.join(runDir, artifact.file);
    return {
      artifact_name: artifact.name,
      path: filePath,
      exists: fs.existsSync(filePath),
      required: artifact.required,
    };
  });
}

function collectBundleFiles(dir: string, base: string, result: Set<string>): void {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.join(base, name);
    if (fs.statSync(full).isDirectory()) {
      collectBundleFiles(full, rel, result);
    } else {
      result.add(rel.replace(/\\/g, "/"));
    }
  }
}

function reconcileManifestTargets(
  runDir: string,
  kitBundleDir: string,
): ManifestTargetMismatch[] {
  const mismatches: ManifestTargetMismatch[] = [];

  if (!fs.existsSync(kitBundleDir)) {
    mismatches.push({
      file_path: kitBundleDir,
      expected: true,
      actual_exists: false,
      reason: "Kit bundle directory does not exist — kit may not have been built",
    });
    return mismatches;
  }

  const bundleFiles = new Set<string>();
  collectBundleFiles(kitBundleDir, "", bundleFiles);

  if (bundleFiles.size === 0) {
    mismatches.push({
      file_path: kitBundleDir,
      expected: true,
      actual_exists: true,
      reason: "Kit bundle directory is empty — no files were generated",
    });
  }

  const packagingManifestPath = path.join(runDir, "kit", "packaging_manifest.json");

  if (fs.existsSync(packagingManifestPath)) {
    try {
      const pm = JSON.parse(fs.readFileSync(packagingManifestPath, "utf-8"));
      const manifestFiles: Array<{ path: string }> = Array.isArray(pm.files) ? pm.files : [];
      for (const mf of manifestFiles) {
        const normalizedPath = mf.path.replace(/^agent_kit\//, "").replace(/\\/g, "/");
        if (!bundleFiles.has(normalizedPath)) {
          mismatches.push({
            file_path: mf.path,
            expected: true,
            actual_exists: false,
            reason: `File listed in packaging_manifest.json missing from kit bundle: ${mf.path}`,
          });
        }
      }
    } catch {
      mismatches.push({
        file_path: packagingManifestPath,
        expected: true,
        actual_exists: true,
        reason: "packaging_manifest.json exists but could not be parsed",
      });
    }
  }

  return mismatches;
}

export function runPackagingPreflight(
  runDir: string,
  kitBundleDir: string,
): PackagingPreflightDecision {
  const blockReasons: string[] = [];

  const artifactChecks = checkKitContractArtifacts(runDir);
  const missingArtifacts = artifactChecks.filter(c => c.required && !c.exists);
  if (missingArtifacts.length > 0) {
    const names = missingArtifacts.map(a => a.artifact_name);
    blockReasons.push(`Missing kit contract artifacts: ${names.join(", ")}`);
  }

  const validationReportPath = path.join(runDir, "kit", "kit_validation_report.json");
  if (fs.existsSync(validationReportPath)) {
    try {
      const report = JSON.parse(fs.readFileSync(validationReportPath, "utf-8"));
      if (report.valid !== true) {
        const errorCount = typeof report.error_count === "number" ? report.error_count : 0;
        blockReasons.push(`Kit validation report has ${errorCount} error(s) — kit structure does not satisfy contract`);
      }
    } catch {
      blockReasons.push("kit_validation_report.json exists but could not be parsed");
    }
  }

  const manifestMismatches = reconcileManifestTargets(runDir, kitBundleDir);
  if (manifestMismatches.length > 0) {
    blockReasons.push(`Manifest target mismatches: ${manifestMismatches.length} file(s) missing from kit bundle`);
  }

  const proofPath = path.join(runDir, "proof", "proof_ledger.jsonl");
  if (!fs.existsSync(proofPath)) {
    blockReasons.push("Proof ledger missing — no verification proof available");
  }

  return {
    allowed: blockReasons.length === 0,
    block_reasons: blockReasons,
    gate_evidence: [],
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
