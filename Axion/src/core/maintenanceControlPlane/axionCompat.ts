import type { AxionCompatibilityReport } from "./types.js";
import { isoNow } from "../../utils/time.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface SchemaSpec {
  schema_id: string;
  required_files: string[];
}

export function validateAxionArtifacts(
  repoPath: string,
  schemas: SchemaSpec[],
): Array<{ check_id: string; status: "pass" | "fail"; message?: string }> {
  const results: Array<{ check_id: string; status: "pass" | "fail"; message?: string }> = [];

  for (const schema of schemas) {
    const missingFiles = schema.required_files.filter((f) => !existsSync(join(repoPath, f)));
    if (missingFiles.length === 0) {
      results.push({ check_id: schema.schema_id, status: "pass" });
    } else {
      results.push({
        check_id: schema.schema_id,
        status: "fail",
        message: `Missing files: ${missingFiles.join(", ")}`,
      });
    }
  }

  return results;
}

export function checkKitOutputValidity(
  kitOutputs: string[],
  requiredOutputs: string[],
): boolean {
  const outputSet = new Set(kitOutputs);
  return requiredOutputs.every((r) => outputSet.has(r));
}

export function buildAxionCompatibilityReport(
  runId: string,
  checksRun: string[],
  results: Array<{ check_id: string; status: "pass" | "fail"; message?: string }>,
  kitOutputValid: boolean,
): AxionCompatibilityReport {
  return {
    run_id: runId,
    checks_run: checksRun,
    results,
    kit_output_valid: kitOutputValid,
    created_at: isoNow(),
  };
}
