import { existsSync } from "node:fs";
import { join } from "node:path";
import { readJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import type { Pinset, PinsetEntry } from "../../types/controlPlane.js";

export interface RegistryManifest {
  registry_id: string;
  registry_type: "standards" | "templates" | "gates" | "schemas" | "toolchain" | "proof_types";
  version: string;
  file_path: string;
}

export interface RegistrySet {
  standards?: unknown;
  templates?: unknown;
  gates?: unknown;
  schemas?: unknown;
  toolchain?: unknown;
  proof_types?: unknown;
  manifests: RegistryManifest[];
}

export interface RegistryResolutionReport {
  loaded: RegistryManifest[];
  failed: Array<{ registry_id: string; error: string }>;
  timestamp: string;
}

export interface PinPolicy {
  strategy: "latest" | "pinned" | "lock";
  overrides?: Record<string, string>;
}

export interface IntegrityCheckResult {
  valid: boolean;
  errors: Array<{ registry_id: string; issue: string }>;
  checked_at: string;
}

export function loadRegistries(registryPaths: Record<string, string>): {
  registries: RegistrySet;
  report: RegistryResolutionReport;
} {
  const manifests: RegistryManifest[] = [];
  const failed: Array<{ registry_id: string; error: string }> = [];
  const registries: RegistrySet = { manifests: [] };

  const typeMap: Record<string, keyof Omit<RegistrySet, "manifests">> = {
    standards: "standards",
    templates: "templates",
    gates: "gates",
    schemas: "schemas",
    toolchain: "toolchain",
    proof_types: "proof_types",
  };

  for (const [registryType, filePath] of Object.entries(registryPaths)) {
    const registryKey = typeMap[registryType];
    if (!registryKey) {
      failed.push({ registry_id: registryType, error: `Unknown registry type: ${registryType}` });
      continue;
    }

    if (!existsSync(filePath)) {
      failed.push({ registry_id: registryType, error: `File not found: ${filePath}` });
      continue;
    }

    try {
      const data = readJson(filePath);
      registries[registryKey] = data;

      const content = JSON.stringify(data);
      const version = (data as Record<string, unknown>)?.version as string ?? "unknown";

      const manifest: RegistryManifest = {
        registry_id: registryType,
        registry_type: registryType as RegistryManifest["registry_type"],
        version,
        file_path: filePath,
      };
      manifests.push(manifest);
    } catch (err) {
      failed.push({
        registry_id: registryType,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  registries.manifests = manifests;

  const report: RegistryResolutionReport = {
    loaded: manifests,
    failed,
    timestamp: new Date().toISOString(),
  };

  return { registries, report };
}

export function resolvePins(pinPolicy: PinPolicy, registries: RegistrySet, runId: string): Pinset {
  const entries: PinsetEntry[] = [];

  for (const manifest of registries.manifests) {
    let resolvedVersion = manifest.version;

    if (pinPolicy.strategy === "pinned" && pinPolicy.overrides?.[manifest.registry_id]) {
      resolvedVersion = pinPolicy.overrides[manifest.registry_id];
    }

    const registryData = registries[manifest.registry_type as keyof Omit<RegistrySet, "manifests">];
    const contentHash = sha256(JSON.stringify(registryData ?? ""));

    entries.push({
      registry_id: manifest.registry_id,
      registry_type: manifest.registry_type,
      resolved_version: resolvedVersion,
      hash: contentHash,
    });
  }

  entries.sort((a, b) => a.registry_id.localeCompare(b.registry_id));

  const pinsetHash = sha256(JSON.stringify(entries));
  const pinsetId = `pinset_${runId}_${pinsetHash.slice(0, 8)}`;

  return {
    pinset_id: pinsetId,
    run_id: runId,
    created_at: new Date().toISOString(),
    resolution_policy: pinPolicy.strategy,
    entries,
    pinset_hash: pinsetHash,
  };
}

export function validateRegistryIntegrity(registries: RegistrySet): IntegrityCheckResult {
  const errors: Array<{ registry_id: string; issue: string }> = [];

  for (const manifest of registries.manifests) {
    const data = registries[manifest.registry_type as keyof Omit<RegistrySet, "manifests">];
    if (!data) {
      errors.push({
        registry_id: manifest.registry_id,
        issue: "Registry data missing after load",
      });
      continue;
    }

    if (typeof data !== "object" || data === null) {
      errors.push({
        registry_id: manifest.registry_id,
        issue: "Registry data is not a valid object",
      });
      continue;
    }

    if (manifest.registry_type === "gates") {
      const gateData = data as { gates?: Array<{ gate_id: string; stage_id: string }> };
      if (!gateData.gates || !Array.isArray(gateData.gates)) {
        errors.push({
          registry_id: manifest.registry_id,
          issue: "Gates registry missing 'gates' array",
        });
      } else {
        const gateIds = new Set<string>();
        for (const gate of gateData.gates) {
          if (!gate.gate_id) {
            errors.push({
              registry_id: manifest.registry_id,
              issue: "Gate entry missing gate_id",
            });
          } else if (gateIds.has(gate.gate_id)) {
            errors.push({
              registry_id: manifest.registry_id,
              issue: `Duplicate gate_id: ${gate.gate_id}`,
            });
          } else {
            gateIds.add(gate.gate_id);
          }
        }
      }
    }

    if (manifest.registry_type === "standards") {
      const stdData = data as { packs?: Array<{ pack_id: string }> };
      if (!stdData.packs || !Array.isArray(stdData.packs)) {
        errors.push({
          registry_id: manifest.registry_id,
          issue: "Standards registry missing 'packs' array",
        });
      } else {
        const packIds = new Set<string>();
        for (const pack of stdData.packs) {
          if (!pack.pack_id) {
            errors.push({
              registry_id: manifest.registry_id,
              issue: "Pack entry missing pack_id",
            });
          } else if (packIds.has(pack.pack_id)) {
            errors.push({
              registry_id: manifest.registry_id,
              issue: `Duplicate pack_id: ${pack.pack_id}`,
            });
          } else {
            packIds.add(pack.pack_id);
          }
        }
      }
    }

    if (manifest.registry_type === "templates") {
      const tplData = data as { templates?: Array<{ template_id: string }> };
      if (!tplData.templates || !Array.isArray(tplData.templates)) {
        errors.push({
          registry_id: manifest.registry_id,
          issue: "Templates registry missing 'templates' array",
        });
      } else {
        const templateIds = new Set<string>();
        for (const tpl of tplData.templates) {
          if (!tpl.template_id) {
            errors.push({
              registry_id: manifest.registry_id,
              issue: "Template entry missing template_id",
            });
          } else if (templateIds.has(tpl.template_id)) {
            errors.push({
              registry_id: manifest.registry_id,
              issue: `Duplicate template_id: ${tpl.template_id}`,
            });
          } else {
            templateIds.add(tpl.template_id);
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checked_at: new Date().toISOString(),
  };
}
