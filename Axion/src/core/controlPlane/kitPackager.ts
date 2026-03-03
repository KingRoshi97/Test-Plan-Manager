import type {
  KitManifestCP,
  KitEntrypoint,
  BundleMetadata,
  EvidencePointer,
  Pinset,
  VerificationPolicy,
} from "../../types/controlPlane.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { writeJson, ensureDir } from "../../utils/fs.js";
import { writeCanonicalJson, canonicalHash } from "../../utils/canonicalJson.js";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

interface CanonicalSpec {
  [key: string]: unknown;
}

interface RenderedDoc {
  template_id: string;
  path: string;
  content: string;
}

interface PlanUnit {
  unit_id: string;
  target: string;
  description: string;
}

interface KitBundleResult {
  manifest: KitManifestCP;
  entrypoint: KitEntrypoint;
  metadata: BundleMetadata;
}

function generateBundleId(): string {
  return `BDL-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function collectFiles(dir: string): Array<{ relativePath: string; content: string }> {
  const results: Array<{ relativePath: string; content: string }> = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = collectFiles(fullPath);
      results.push(...subFiles);
    } else if (entry.isFile()) {
      try {
        const content = readFileSync(fullPath, "utf-8");
        results.push({ relativePath: relative(dir, fullPath), content });
      } catch {
        // skip unreadable
      }
    }
  }
  return results;
}

function buildInventory(
  runDir: string,
  files: Array<{ relativePath: string; content: string }>,
): Array<{ artifact_id: string; path: string; hash: string; required: boolean }> {
  return files.map((f, i) => ({
    artifact_id: `ART-${String(i + 1).padStart(4, "0")}`,
    path: f.relativePath,
    hash: sha256(f.content),
    required: true,
  }));
}

const REQUIRED_ARTIFACT_PATTERNS = [
  "canonical_spec",
  "standards_snapshot",
  "run_manifest",
  "pinset",
];

export function packageKit(
  runDir: string,
  canonicalSpec: CanonicalSpec,
  snapshot: Record<string, unknown>,
  rendered: RenderedDoc[],
  planUnits: PlanUnit[],
  verificationPolicy: VerificationPolicy | null,
): KitBundleResult {
  const bundleId = generateBundleId();
  const runId = (canonicalSpec["run_id"] as string) ?? bundleId;

  const files = collectFiles(runDir);
  const inventory = buildInventory(runDir, files);

  const requiredChecklist = REQUIRED_ARTIFACT_PATTERNS.map((pattern) => ({
    artifact_id: pattern,
    present: files.some((f) => f.relativePath.includes(pattern)),
  }));

  const allContent = files.map((f) => f.content).join("");
  const bundleHash = sha256(allContent + JSON.stringify(canonicalSpec) + JSON.stringify(snapshot));

  const manifest: KitManifestCP = {
    kit_id: `KIT-${runId}`,
    run_id: runId,
    pinset_ref: `pinset_${runId}.json`,
    inventory,
    required_artifacts_checklist: requiredChecklist,
    kit_export_metadata: {
      bundle_id: bundleId,
      bundle_hash: bundleHash,
    },
  };

  const readingOrder = [
    "canonical_spec.json",
    "standards_snapshot.json",
    ...rendered.map((r) => r.path),
    "plan_units.json",
  ];

  const executionInstructions = [
    { step: 1, action: "read", target: "canonical_spec.json" },
    { step: 2, action: "read", target: "standards_snapshot.json" },
    { step: 3, action: "read", target: "plan_units.json" },
    ...planUnits.map((u, i) => ({
      step: i + 4,
      action: "execute",
      target: u.unit_id,
    })),
  ];

  const entrypoint: KitEntrypoint = {
    reading_order: readingOrder,
    execution_instructions: executionInstructions,
    plan_units_ref: "plan_units.json",
    verification_policy_ref: verificationPolicy ? "verification_policy.json" : undefined,
  };

  const metadata: BundleMetadata = {
    bundle_id: bundleId,
    run_id: runId,
    created_at: isoNow(),
    pinset_hash: sha256(JSON.stringify(snapshot)),
    artifact_count: inventory.length,
    bundle_hash: bundleHash,
  };

  const kitDir = join(runDir, "kit");
  ensureDir(kitDir);
  writeCanonicalJson(join(kitDir, "kit_manifest.json"), manifest);
  writeCanonicalJson(join(kitDir, "kit_entrypoint.json"), entrypoint);
  writeCanonicalJson(join(kitDir, "bundle_metadata.json"), metadata);
  writeCanonicalJson(join(kitDir, "canonical_spec.json"), canonicalSpec);
  writeCanonicalJson(join(kitDir, "standards_snapshot.json"), snapshot);
  writeJson(join(kitDir, "plan_units.json"), planUnits);

  if (verificationPolicy) {
    writeCanonicalJson(join(kitDir, "verification_policy.json"), verificationPolicy);
  }

  for (const doc of rendered) {
    const docPath = join(kitDir, doc.path);
    ensureDir(join(docPath, ".."));
    writeCanonicalJson(docPath, { template_id: doc.template_id, content: doc.content });
  }

  return { manifest, entrypoint, metadata };
}
