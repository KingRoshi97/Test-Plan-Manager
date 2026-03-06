import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";
import { buildSpec } from "../../core/canonical/specBuilder.js";
import { extractUnknowns, mergeUnknowns } from "../../core/canonical/unknowns.js";

export function cmdBuildSpec(runDir: string): void {
  const baseDir = join(process.cwd(), "Axion");

  const normalizedPath = join(runDir, "intake", "normalized_input.json");
  if (!existsSync(normalizedPath)) {
    console.error(`normalized_input.json not found in ${runDir}. Run intake stage first.`);
    process.exit(1);
  }

  let normalizedInput: Record<string, unknown>;
  try {
    normalizedInput = readJson<Record<string, unknown>>(normalizedPath);
  } catch (err) {
    console.error(`Failed to read normalized input: ${(err as Error).message}`);
    process.exit(1);
  }

  const runId = normalizedInput.run_id as string ?? "unknown";
  const generatedAt = isoNow();

  const canonicalSpec = buildSpec(normalizedInput, null, baseDir);
  const unknownsResult = extractUnknowns(normalizedInput, canonicalSpec);
  canonicalSpec.unknowns = mergeUnknowns(canonicalSpec.unknowns, unknownsResult.unknowns);

  writeCanonicalJson(join(runDir, "canonical", "canonical_spec.json"), {
    run_id: runId,
    generated_at: generatedAt,
    ...canonicalSpec,
  });
  writeCanonicalJson(join(runDir, "canonical", "unknowns.json"), unknownsResult);

  const entityCount =
    (canonicalSpec.entities?.roles?.length ?? 0) +
    (canonicalSpec.entities?.features?.length ?? 0) +
    (canonicalSpec.entities?.workflows?.length ?? 0);
  console.log(`Built canonical spec with ${entityCount} entities, ${unknownsResult.unknowns.length} unknowns`);
}
