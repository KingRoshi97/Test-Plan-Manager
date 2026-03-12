import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type { KitManifest } from "./schemas.js";

export interface KitValidationResult {
  valid: boolean;
  errors: string[];
  errorCount: number;
}

const REQUIRED_ROOT_FILES = [
  "00_START_HERE.md",
  "00_KIT_MANIFEST.md",
  "00_KIT_INDEX.md",
  "00_VERSIONS.md",
  "00_RUN_RULES.md",
  "00_PROOF_LOG.md",
];

const REQUIRED_CORE_ARTIFACTS = [
  "01_normalized_input_record.json",
  "02_resolved_standards_snapshot.json",
  "03_canonical_spec.json",
  "04_work_breakdown.json",
  "05_acceptance_map.json",
  "06_state_snapshot.json",
];

const REQUIRED_APP_PACK_FILES = [
  "00_pack_meta.md",
  "00_pack_index.md",
  "00_gate_checklist.md",
];

function resolveKitRoot(manifest: KitManifest): string | null {
  if (manifest.artifacts.length === 0) return null;
  const firstPath = manifest.artifacts[0].path;
  const parts = firstPath.split("/");
  if (parts.length >= 2 && parts[0] === "agent_kit") {
    return null;
  }
  return null;
}

function findBasePath(manifestPath: string): string {
  return dirname(manifestPath);
}

export function validateKit(manifest: KitManifest): KitValidationResult {
  const errors: string[] = [];

  if (!manifest.kit_id) {
    errors.push("Missing required field: kit_id");
  }
  if (!manifest.run_id) {
    errors.push("Missing required field: run_id");
  }
  if (!manifest.version) {
    errors.push("Missing required field: version");
  }
  if (!manifest.created_at) {
    errors.push("Missing required field: created_at");
  }
  if (!Array.isArray(manifest.artifacts)) {
    errors.push("Missing or invalid field: artifacts (must be an array)");
  }

  return {
    valid: errors.length === 0,
    errors,
    errorCount: errors.length,
  };
}

export function validateKitOnDisk(kitRootDir: string, manifest: KitManifest): KitValidationResult {
  const errors: string[] = [];

  const baseResult = validateKit(manifest);
  errors.push(...baseResult.errors);

  const agentKitDir = join(kitRootDir, "bundle", "agent_kit");

  for (const rootFile of REQUIRED_ROOT_FILES) {
    const filePath = join(agentKitDir, rootFile);
    if (!existsSync(filePath)) {
      errors.push(`Missing required root file: ${rootFile}`);
    }
  }

  const coreDir = join(agentKitDir, "01_core_artifacts");
  for (const artifact of REQUIRED_CORE_ARTIFACTS) {
    const artifactPath = join(coreDir, artifact);
    if (!existsSync(artifactPath)) {
      errors.push(`Missing required core artifact: 01_core_artifacts/${artifact}`);
    }
  }

  const jsonArtifacts = REQUIRED_CORE_ARTIFACTS.filter((f) => f.endsWith(".json"));
  for (const artifact of jsonArtifacts) {
    const artifactPath = join(coreDir, artifact);
    if (existsSync(artifactPath)) {
      try {
        const content = readFileSync(artifactPath, "utf-8");
        JSON.parse(content);
      } catch {
        errors.push(`Invalid JSON in core artifact: 01_core_artifacts/${artifact}`);
      }
    }
  }

  const appPackDir = join(agentKitDir, "10_app");
  if (!existsSync(appPackDir)) {
    errors.push("Missing required directory: 10_app/ (app pack root per KIT-01)");
  } else {
    for (const packFile of REQUIRED_APP_PACK_FILES) {
      const filePath = join(appPackDir, packFile);
      if (!existsSync(filePath)) {
        errors.push(`Missing required app pack file: 10_app/${packFile}`);
      }
    }
  }

  const versionStampPath = join(kitRootDir, "version_stamp.json");
  if (!existsSync(versionStampPath)) {
    const altPath = join(agentKitDir, "00_VERSIONS.md");
    if (!existsSync(altPath)) {
      errors.push("Missing version stamp: neither kit/version_stamp.json nor agent_kit/00_VERSIONS.md found");
    }
  }

  if (Array.isArray(manifest.artifacts)) {
    for (const entry of manifest.artifacts) {
      const filePath = join(kitRootDir, "bundle", entry.path);
      if (!existsSync(filePath)) {
        errors.push(`Manifest references missing file: ${entry.path}`);
      }
    }
  }

  const workBreakdownPath = join(coreDir, "04_work_breakdown.json");
  const acceptanceMapPath = join(coreDir, "05_acceptance_map.json");

  if (existsSync(workBreakdownPath) && existsSync(acceptanceMapPath)) {
    try {
      const wbContent = readFileSync(workBreakdownPath, "utf-8");
      const wbData = JSON.parse(wbContent) as Record<string, unknown>;
      const amContent = readFileSync(acceptanceMapPath, "utf-8");
      const amData = JSON.parse(amContent) as Record<string, unknown>;

      const wbUnits = Array.isArray(wbData.units) ? wbData.units as Array<Record<string, unknown>> : [];
      const wbUnitIds = new Set(wbUnits.map((u) => u.unit_id as string).filter(Boolean));

      const amItems = Array.isArray(amData.items) ? amData.items as Array<Record<string, unknown>> : [];
      for (const item of amItems) {
        const unitRef = item.unit_id as string | undefined;
        if (unitRef && wbUnitIds.size > 0 && !wbUnitIds.has(unitRef)) {
          errors.push(`Acceptance map item references unknown work breakdown unit: ${unitRef}`);
        }
      }
    } catch {
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    errorCount: errors.length,
  };
}
