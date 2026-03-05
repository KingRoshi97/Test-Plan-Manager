import { join, dirname } from "node:path";
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { ensureDir, readJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { writeCanonicalJson, canonicalJsonString } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";

export interface KitBuildResult {
  fileCount: number;
  contentHash: string;
}

interface BundleFileEntry {
  path: string;
  role: string;
  hash: string;
  bytes: number;
}

function collectFiles(dir: string, base: string, entries: BundleFileEntry[], role: string): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = join(base, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, rel, entries, role);
    } else {
      const content = readFileSync(full, "utf-8");
      entries.push({
        path: rel,
        role,
        hash: sha256(content),
        bytes: stat.size,
      });
    }
  }
}

function safeRead(filePath: string): string | null {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function copyToBundleIfExists(srcPath: string, bundleDir: string, destRel: string): boolean {
  const content = safeRead(srcPath);
  if (content === null) return false;
  const destPath = join(bundleDir, destRel);
  ensureDir(dirname(destPath));
  writeFileSync(destPath, content, "utf-8");
  return true;
}

export function buildRealKit(
  runDir: string,
  runId: string,
  generatedAt: string,
  baseDir: string,
): KitBuildResult {
  const bundleDir = join(runDir, "kit", "bundle");
  ensureDir(bundleDir);

  let specId = "SPEC-UNKNOWN";
  try {
    const spec = readJson<Record<string, unknown>>(join(runDir, "canonical", "canonical_spec.json"));
    const meta = spec.meta as Record<string, unknown> | undefined;
    if (meta?.spec_id) specId = meta.spec_id as string;
  } catch { /* use default */ }

  copyToBundleIfExists(join(runDir, "canonical", "canonical_spec.json"), bundleDir, "canonical/canonical_spec.json");
  copyToBundleIfExists(join(runDir, "canonical", "unknowns.json"), bundleDir, "canonical/unknowns.json");

  copyToBundleIfExists(join(runDir, "standards", "resolved_standards_snapshot.json"), bundleDir, "standards/resolved_standards_snapshot.json");
  copyToBundleIfExists(join(runDir, "standards", "applicability_output.json"), bundleDir, "standards/applicability_output.json");

  copyToBundleIfExists(join(runDir, "templates", "selection_result.json"), bundleDir, "templates/selection_result.json");
  copyToBundleIfExists(join(runDir, "templates", "template_completeness_report.json"), bundleDir, "templates/template_completeness_report.json");

  const renderedDocsDir = join(runDir, "templates", "rendered_docs");
  if (existsSync(renderedDocsDir)) {
    const destRendered = join(bundleDir, "templates", "rendered_docs");
    ensureDir(destRendered);
    for (const file of readdirSync(renderedDocsDir)) {
      const src = join(renderedDocsDir, file);
      if (statSync(src).isFile()) {
        writeFileSync(join(destRendered, file), readFileSync(src, "utf-8"), "utf-8");
      }
    }
  }

  copyToBundleIfExists(join(runDir, "planning", "work_breakdown.json"), bundleDir, "planning/work_breakdown.json");
  copyToBundleIfExists(join(runDir, "planning", "acceptance_map.json"), bundleDir, "planning/acceptance_map.json");
  copyToBundleIfExists(join(runDir, "planning", "coverage_report.json"), bundleDir, "planning/coverage_report.json");

  const gatesDir = join(runDir, "gates");
  if (existsSync(gatesDir)) {
    const destGates = join(bundleDir, "gates");
    ensureDir(destGates);
    for (const file of readdirSync(gatesDir)) {
      if (file.endsWith(".gate_report.json")) {
        writeFileSync(join(destGates, file), readFileSync(join(gatesDir, file), "utf-8"), "utf-8");
      }
    }
  }

  copyToBundleIfExists(join(runDir, "proof", "proof_ledger.jsonl"), bundleDir, "proof/proof_ledger.jsonl");
  copyToBundleIfExists(join(runDir, "verification", "verification_run_result.json"), bundleDir, "verification/verification_run_result.json");
  copyToBundleIfExists(join(runDir, "verification", "completion_report.json"), bundleDir, "verification/completion_report.json");

  let libraryVersions: Record<string, { id: string; version: string; hash?: string }> = {};
  try {
    const pinsPath = join(baseDir, "Axion/registries/PINS_DEFAULT.v1.json");
    if (existsSync(pinsPath)) {
      const pins = readJson<{ pins: Record<string, { id: string; version: string }> }>(pinsPath);
      for (const [key, pin] of Object.entries(pins.pins)) {
        if (key === "library_index" || key === "schema_registry") continue;
        libraryVersions[key] = { id: pin.id, version: pin.version };
      }
    }
  } catch { /* skip */ }

  const now = isoNow();

  const versionStamp = {
    version: "1.0.0",
    run_id: runId,
    pins: {
      intake: { id: "intake.form_version", version: libraryVersions["intake.form_version"]?.version ?? "1.0.0" },
      canonical: { id: "canonical.id_rules", version: libraryVersions["canonical.id_rules"]?.version ?? "1.0.0" },
      standards: { id: "standards.resolver_rules", version: libraryVersions["standards.resolver_rules"]?.version ?? "1.0.0" },
      templates: { id: "templates.index", version: libraryVersions["templates.index"]?.version ?? "1.0.0" },
      planning: { id: "planning.sequencing_policy", version: libraryVersions["planning.sequencing_policy"]?.version ?? "1.0.0" },
      gates: { id: "gates.dsl.v1", version: libraryVersions["gates.dsl.schema"]?.version ?? "1.0.0" },
    },
  };

  writeCanonicalJson(join(bundleDir, "version_stamp.json"), versionStamp);

  const entrypoint = {
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    start_here: "Read entrypoint.json, then kit_manifest.json",
    how_to_use: [
      "1. Read version_stamp.json for library versions used",
      "2. Read kit_manifest.json for file listing",
      "3. Browse canonical/ for the canonical spec",
      "4. Browse standards/ for resolved standards",
      "5. Browse templates/rendered_docs/ for generated documents",
      "6. Browse planning/ for work breakdown and acceptance map",
      "7. Browse proof/ for proof ledger",
    ],
    do_not_do: [
      "Do not modify bundle files directly",
      "Do not repackage without re-running gates",
    ],
    links: [
      { label: "Canonical Spec", path: "canonical/canonical_spec.json" },
      { label: "Work Breakdown", path: "planning/work_breakdown.json" },
      { label: "Proof Ledger", path: "proof/proof_ledger.jsonl" },
    ],
  };

  writeCanonicalJson(join(bundleDir, "entrypoint.json"), entrypoint);

  const bundleEntries: BundleFileEntry[] = [];
  collectFiles(join(bundleDir, "canonical"), "canonical", bundleEntries, "canonical");
  collectFiles(join(bundleDir, "standards"), "standards", bundleEntries, "standards");
  collectFiles(join(bundleDir, "templates"), "templates", bundleEntries, "templates");
  collectFiles(join(bundleDir, "planning"), "planning", bundleEntries, "planning");
  collectFiles(join(bundleDir, "gates"), "gates", bundleEntries, "gates");
  collectFiles(join(bundleDir, "proof"), "proof", bundleEntries, "proof");
  collectFiles(join(bundleDir, "verification"), "verification", bundleEntries, "misc");

  const entrypointContent = readFileSync(join(bundleDir, "entrypoint.json"), "utf-8");
  bundleEntries.push({
    path: "entrypoint.json",
    role: "entrypoint",
    hash: sha256(entrypointContent),
    bytes: Buffer.byteLength(entrypointContent),
  });

  const versionStampContent = readFileSync(join(bundleDir, "version_stamp.json"), "utf-8");
  bundleEntries.push({
    path: "version_stamp.json",
    role: "versions",
    hash: sha256(versionStampContent),
    bytes: Buffer.byteLength(versionStampContent),
  });

  const kitManifest = {
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    created_at: now,
    files: bundleEntries.map((e) => ({
      path: e.path,
      role: e.role,
      hash: e.hash,
      bytes: e.bytes,
    })),
  };

  writeCanonicalJson(join(bundleDir, "kit_manifest.json"), kitManifest);

  const kitManifestContent = readFileSync(join(bundleDir, "kit_manifest.json"), "utf-8");
  bundleEntries.push({
    path: "kit_manifest.json",
    role: "misc",
    hash: sha256(kitManifestContent),
    bytes: Buffer.byteLength(kitManifestContent),
  });

  const allBundleFiles = bundleEntries.map((e) => ({
    path: e.path,
    sha256: e.hash,
  }));

  const totalBytes = bundleEntries.reduce((sum, e) => sum + e.bytes, 0);
  const contentHash = sha256(canonicalJsonString(allBundleFiles));

  writeCanonicalJson(join(runDir, "kit", "packaging_manifest.json"), {
    algorithm: "sha256",
    files: allBundleFiles,
    generated_at: now,
    root: "kit/bundle",
    run_id: runId,
  });

  writeCanonicalJson(join(runDir, "kit", "kit_manifest.json"), kitManifest);
  writeCanonicalJson(join(runDir, "kit", "entrypoint.json"), entrypoint);
  writeCanonicalJson(join(runDir, "kit", "version_stamp.json"), versionStamp);

  return {
    fileCount: bundleEntries.length,
    contentHash,
  };
}
