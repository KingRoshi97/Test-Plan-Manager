import { existsSync } from "node:fs";
import { join } from "node:path";
import { isoNow } from "../../utils/time.js";
import { readJson } from "../../utils/fs.js";
import type { KitValidationReport } from "./types.js";

const REQUIRED_ARTIFACTS = [
  { artifact: "kit_manifest.json", description: "Kit manifest with inventory" },
  { artifact: "kit_entrypoint.json", description: "Kit entrypoint with reading order" },
  { artifact: "pinset.json", description: "Frozen pinset for reproducibility" },
  { artifact: "plan_units/", description: "Plan units directory" },
];

export function validateKit(kitDir: string): KitValidationReport {
  const checks: KitValidationReport["checks"] = [];
  const kitId = kitDir.split("/").pop() ?? "unknown";

  for (const req of REQUIRED_ARTIFACTS) {
    const fullPath = join(kitDir, req.artifact);
    const exists = existsSync(fullPath);
    checks.push({
      check_id: `artifact_exists:${req.artifact}`,
      description: `Required artifact present: ${req.description}`,
      status: exists ? "pass" : "fail",
      message: exists ? undefined : `Missing: ${fullPath}`,
    });
  }

  const manifestPath = join(kitDir, "kit_manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = readJson<Record<string, unknown>>(manifestPath);
      const hasKitId = typeof manifest.kit_id === "string" && manifest.kit_id.length > 0;
      checks.push({
        check_id: "schema_valid:kit_manifest",
        description: "Kit manifest has valid schema (kit_id present)",
        status: hasKitId ? "pass" : "fail",
        message: hasKitId ? undefined : "kit_id missing or empty",
      });
      const hasPinsetRef = typeof manifest.pinset_ref === "string";
      checks.push({
        check_id: "pinset_ref:kit_manifest",
        description: "Kit manifest references pinset",
        status: hasPinsetRef ? "pass" : "fail",
        message: hasPinsetRef ? undefined : "pinset_ref missing",
      });
    } catch {
      checks.push({
        check_id: "schema_valid:kit_manifest",
        description: "Kit manifest is valid JSON",
        status: "fail",
        message: "Failed to parse kit_manifest.json",
      });
    }
  }

  const entrypointPath = join(kitDir, "kit_entrypoint.json");
  if (existsSync(entrypointPath)) {
    try {
      const entrypoint = readJson<Record<string, unknown>>(entrypointPath);
      const hasReadingOrder = Array.isArray(entrypoint.reading_order) && entrypoint.reading_order.length > 0;
      checks.push({
        check_id: "entrypoint_compliance",
        description: "Kit entrypoint has reading_order",
        status: hasReadingOrder ? "pass" : "fail",
        message: hasReadingOrder ? undefined : "reading_order missing or empty",
      });
    } catch {
      checks.push({
        check_id: "entrypoint_compliance",
        description: "Kit entrypoint is valid JSON",
        status: "fail",
        message: "Failed to parse kit_entrypoint.json",
      });
    }
  }

  const pinsetPath = join(kitDir, "pinset.json");
  if (existsSync(pinsetPath)) {
    try {
      const pinset = readJson<Record<string, unknown>>(pinsetPath);
      const hasPinsetId = typeof pinset.pinset_id === "string";
      checks.push({
        check_id: "pinset_valid",
        description: "Pinset has pinset_id",
        status: hasPinsetId ? "pass" : "fail",
        message: hasPinsetId ? undefined : "pinset_id missing",
      });
    } catch {
      checks.push({
        check_id: "pinset_valid",
        description: "Pinset is valid JSON",
        status: "fail",
        message: "Failed to parse pinset.json",
      });
    }
  }

  const allPassed = checks.every((c) => c.status === "pass");

  return {
    kit_id: kitId,
    status: allPassed ? "VALID" : "INVALID",
    checks,
    validated_at: isoNow(),
  };
}
