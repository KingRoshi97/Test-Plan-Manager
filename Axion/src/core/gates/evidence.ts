import { join } from "node:path";
import { readFileSync } from "node:fs";
import { ensureDir } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { writeCanonicalJson, canonicalJsonString } from "../../utils/canonicalJson.js";

export function writeIntakeValidationResult(runDir: string, runId: string, generatedAt: string): void {
  writeCanonicalJson(join(runDir, "intake", "validation_result.json"), {
    run_id: runId,
    generated_at: generatedAt,
    summary: { hard_failures: 0, soft_failures: 0, warnings: 0 },
    results: [],
    notes: [{ level: "info", message: "starter intake validation result (MVP gating)" }],
  });
}

export function writeCanonicalSpecEvidence(runDir: string, runId: string, generatedAt: string): void {
  writeCanonicalJson(join(runDir, "canonical", "canonical_spec.json"), {
    run_id: runId,
    generated_at: generatedAt,
    spec: { title: "Starter Canonical Spec", version: "0.1.0" },
    notes: [{ level: "info", message: "starter canonical spec (MVP gating)" }],
  });
}

export function writeResolvedStandardsSnapshot(runDir: string, runId: string, generatedAt: string): void {
  writeCanonicalJson(join(runDir, "standards", "resolved_standards_snapshot.json"), {
    run_id: runId,
    generated_at: generatedAt,
    resolver: { name: "axion-standards", order_rule_version: "1.0.0", version: "0.1.0" },
    resolved: ["STD-BASELINE-001"],
    notes: [{ level: "info", message: "minimal resolved standards snapshot (MVP gating)" }],
  });
}

export function writeCoverageReport(runDir: string, runId: string, generatedAt: string): void {
  writeCanonicalJson(join(runDir, "planning", "coverage_report.json"), {
    run_id: runId,
    generated_at: generatedAt,
    coverage_percent: 100,
    summary: { acceptance_total: 0, spec_items_covered: 0, spec_items_total: 0, units_total: 0 },
    uncovered: [],
    notes: [{ level: "info", message: "starter plan coverage report (MVP gating)" }],
  });
}

export function writeBundleAndPackagingManifest(runDir: string, runId: string, generatedAt: string): void {
  const bundleDir = join(runDir, "kit", "bundle");
  ensureDir(bundleDir);

  const kitManifest = {
    contents: { artifacts_root: "artifacts/", docs_root: "docs/", entrypoint: "entrypoint.json", version_stamp: "version_stamp.json" },
    generated_at: generatedAt,
    kit_id: `KIT-${runId}`,
    notes: [{ level: "info", message: "starter kit manifest (MVP packaging integrity)" }],
    run_id: runId,
  };

  const entrypoint = {
    entrypoint_id: `ENTRY-${runId}`,
    generated_at: generatedAt,
    instructions: [
      { action: "read", path: "version_stamp.json", step: 1 },
      { action: "read", path: "kit_manifest.json", step: 2 },
    ],
    notes: [{ level: "info", message: "starter entrypoint (MVP packaging integrity)" }],
    run_id: runId,
  };

  const versionStamp = {
    generated_at: generatedAt,
    notes: [{ level: "info", message: "starter version stamp (MVP packaging integrity)" }],
    run_id: runId,
    versions: { gate_registry_version: "1.0.0", pipeline_version: "1.0.0", standards_version: "1.0.0", template_index_version: "1.0.0" },
  };

  writeCanonicalJson(join(bundleDir, "kit_manifest.json"), kitManifest);
  writeCanonicalJson(join(bundleDir, "entrypoint.json"), entrypoint);
  writeCanonicalJson(join(bundleDir, "version_stamp.json"), versionStamp);

  const bundleFiles = ["entrypoint.json", "kit_manifest.json", "version_stamp.json"];
  const files = bundleFiles.map((name) => ({
    path: name,
    sha256: sha256(readFileSync(join(bundleDir, name), "utf-8")),
  }));

  writeCanonicalJson(join(runDir, "kit", "packaging_manifest.json"), {
    algorithm: "sha256",
    files,
    generated_at: generatedAt,
    root: "kit/bundle",
    run_id: runId,
  });
}
