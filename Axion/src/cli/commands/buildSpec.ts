import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { buildSpec } from "../../core/canonical/specBuilder.js";
import { extractUnknowns } from "../../core/canonical/unknowns.js";

export function cmdBuildSpec(runDir: string): void {
  const normalizedPath = join(runDir, "intake", "normalized_payload.json");
  if (!existsSync(normalizedPath)) {
    console.error(`Normalized payload not found at: ${normalizedPath}`);
    process.exit(1);
  }

  const normalized = readJson(normalizedPath);

  let standards: unknown = {};
  const standardsPath = join(runDir, "standards", "resolved_standards_snapshot.json");
  if (existsSync(standardsPath)) {
    standards = readJson(standardsPath);
  }

  const spec = buildSpec(normalized, standards);

  const unknownsResult = extractUnknowns(normalized, spec);
  spec.unknowns = unknownsResult.unknowns;

  writeCanonicalJson(join(runDir, "canonical", "canonical_spec.json"), spec);
  writeCanonicalJson(join(runDir, "canonical", "unknowns_assumptions.json"), unknownsResult);

  console.log(`Canonical spec written to: canonical/canonical_spec.json`);
  console.log(`Unknowns written to: canonical/unknowns_assumptions.json`);
  console.log(`  Entities: ${spec.entities.roles.length} roles, ${spec.entities.features.length} features, ${spec.entities.workflows.length} workflows`);
  console.log(`  Unknowns: ${unknownsResult.stats.total} total, ${unknownsResult.stats.blocking} blocking`);
}
