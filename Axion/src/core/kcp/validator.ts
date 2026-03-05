import { existsSync } from "node:fs";
import { join } from "node:path";
import { isoNow } from "../../utils/time.js";
import { readJson } from "../../utils/fs.js";
import type { KitValidationReport } from "./model.js";

interface ValidationCheck {
  check_id: string;
  description: string;
  passed: boolean;
  detail?: string;
}

export function validateKitIntegrity(
  kitPath: string,
  kitRunId: string,
): KitValidationReport {
  const checks: ValidationCheck[] = [];

  const manifestPath = join(kitPath, "kit_manifest.json");
  const manifestExists = existsSync(manifestPath);
  checks.push({
    check_id: "KV-01",
    description: "Kit manifest present",
    passed: manifestExists,
    detail: manifestExists ? undefined : `Missing: ${manifestPath}`,
  });

  let manifest: Record<string, unknown> | null = null;
  if (manifestExists) {
    try {
      manifest = readJson<Record<string, unknown>>(manifestPath);
      const hasRequiredFields =
        typeof manifest.kit_id === "string" &&
        typeof manifest.run_id === "string" &&
        typeof manifest.version === "string";
      checks.push({
        check_id: "KV-02",
        description: "Kit manifest schema valid",
        passed: hasRequiredFields,
        detail: hasRequiredFields ? undefined : "Missing required fields: kit_id, run_id, or version",
      });
    } catch (err) {
      checks.push({
        check_id: "KV-02",
        description: "Kit manifest schema valid",
        passed: false,
        detail: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const entrypointPath = join(kitPath, "entrypoint.json");
  const entrypointExists = existsSync(entrypointPath);
  checks.push({
    check_id: "KV-03",
    description: "Entrypoint present",
    passed: entrypointExists,
    detail: entrypointExists ? undefined : `Missing: ${entrypointPath}`,
  });

  if (entrypointExists) {
    try {
      const entrypoint = readJson<Record<string, unknown>>(entrypointPath);
      const hasFields =
        typeof entrypoint.run_id === "string" &&
        typeof entrypoint.kit_root === "string";
      checks.push({
        check_id: "KV-04",
        description: "Entrypoint schema valid",
        passed: hasFields,
        detail: hasFields ? undefined : "Missing required fields: run_id or kit_root",
      });
    } catch (err) {
      checks.push({
        check_id: "KV-04",
        description: "Entrypoint schema valid",
        passed: false,
        detail: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const coreArtifactsDir = join(kitPath, "bundle", "agent_kit", "01_core_artifacts");
  const requiredArtifacts = [
    "01_normalized_input_record.json",
    "03_canonical_spec.json",
    "04_work_breakdown.json",
    "05_acceptance_map.json",
    "06_state_snapshot.json",
  ];

  for (const artifact of requiredArtifacts) {
    const artifactPath = join(coreArtifactsDir, artifact);
    const exists = existsSync(artifactPath);
    checks.push({
      check_id: `KV-05-${artifact}`,
      description: `Required artifact present: ${artifact}`,
      passed: exists,
      detail: exists ? undefined : `Missing: ${artifactPath}`,
    });
  }

  const pinsetPath = join(kitPath, "bundle", "agent_kit", "pinset.json");
  if (existsSync(pinsetPath)) {
    try {
      readJson(pinsetPath);
      checks.push({
        check_id: "KV-06",
        description: "Pinset parseable",
        passed: true,
      });
    } catch (err) {
      checks.push({
        check_id: "KV-06",
        description: "Pinset parseable",
        passed: false,
        detail: `Parse error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  const valid = checks.every((c) => c.passed);

  return {
    kit_run_id: kitRunId,
    valid,
    checks,
    timestamp: isoNow(),
  };
}
