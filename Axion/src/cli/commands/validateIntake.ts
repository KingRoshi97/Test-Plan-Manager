import { readFileSync } from "fs";
import { resolve } from "path";
import { validateIntake } from "../../core/intake/validator.js";

export function cmdValidateIntake(inputPath: string, schemaVersion?: string): void {
  const resolvedPath = resolve(inputPath);
  let submission: unknown;
  try {
    const raw = readFileSync(resolvedPath, "utf-8");
    submission = JSON.parse(raw);
  } catch (err) {
    console.error(`[validate-intake] Failed to read or parse submission file: ${resolvedPath}`);
    console.error(`  ${(err as Error).message}`);
    process.exit(1);
  }

  const version = schemaVersion || "1.0.0";
  const result = validateIntake(submission, version);

  console.log(`\n[validate-intake] Submission: ${result.submission_id}`);
  console.log(`  Schema version: ${result.schema_version_used}`);
  console.log(`  Ruleset version: ${result.ruleset_version_used}`);
  console.log(`  Valid: ${result.is_valid}`);
  console.log(`  Errors: ${result.summary.error_count}`);
  console.log(`  Warnings: ${result.summary.warning_count}`);

  if (result.errors.length > 0) {
    console.log("\n  Errors:");
    for (const err of result.errors) {
      console.log(`    [${err.error_code}] ${err.field_path}: ${err.message} (rule: ${err.rule_id})`);
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n  Warnings:");
    for (const warn of result.warnings) {
      console.log(`    [${warn.error_code}] ${warn.field_path}: ${warn.message} (rule: ${warn.rule_id})`);
    }
  }

  if (result.summary.blocking_rule_ids.length > 0) {
    console.log(`\n  Blocking rules: ${result.summary.blocking_rule_ids.join(", ")}`);
  }

  console.log(`\n  Result: ${JSON.stringify(result, null, 2)}`);

  if (!result.is_valid) {
    process.exit(1);
  }
}
