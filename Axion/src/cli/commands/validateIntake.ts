import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { validateIntake as coreValidateIntake } from "../../core/intake/validator.js";
import { isoNow } from "../../utils/time.js";

export function cmdValidateIntake(inputPath: string, schemaVersion?: string): void {
  const baseDir = join(process.cwd(), "Axion");

  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  let normalizedInput: Record<string, unknown>;
  try {
    normalizedInput = readJson<Record<string, unknown>>(inputPath);
  } catch (err) {
    console.error(`Failed to read input: ${(err as Error).message}`);
    process.exit(1);
  }

  const version = schemaVersion ?? "1.0.0";
  const result = coreValidateIntake(normalizedInput, version, baseDir);

  const report = {
    validated_at: isoNow(),
    input_path: inputPath,
    schema_version: version,
    is_valid: result.is_valid,
    error_count: result.summary.error_count,
    warning_count: result.summary.warning_count,
    blocking_rule_ids: result.summary.blocking_rule_ids,
    errors: result.errors,
    warnings: result.warnings,
  };

  console.log(JSON.stringify(report, null, 2));

  if (!result.is_valid) {
    process.exit(1);
  }
}
