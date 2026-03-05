import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";
import { loadStandardsRegistry } from "../../core/standards/registryLoader.js";
import { evaluateApplicability } from "../../core/standards/applicability.js";
import { resolveStandards as coreResolveStandards } from "../../core/standards/resolver.js";
import { writeSnapshot } from "../../core/standards/snapshot.js";

export function cmdResolveStandards(runDir: string, libraryPath?: string): void {
  const baseDir = libraryPath ?? join(process.cwd(), "Axion");

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
  const registry = loadStandardsRegistry(baseDir);

  const routing = (normalizedInput.routing ?? {}) as {
    skill_level: string;
    category: string;
    type_preset: string;
    build_target: string;
    audience_context: string;
  };
  const constraints = (normalizedInput.constraints ?? {}) as Record<string, unknown>;

  const applicabilityOutput = evaluateApplicability(
    routing,
    constraints,
    registry.index.packs,
    registry.resolverRules,
    runId,
    isoNow()
  );

  writeCanonicalJson(join(runDir, "standards", "applicability_output.json"), applicabilityOutput);

  const { snapshot, resolverOutput } = coreResolveStandards(
    normalizedInput,
    registry,
    applicabilityOutput.matched_packs,
    runId
  );

  writeSnapshot(runDir, snapshot);
  writeCanonicalJson(join(runDir, "standards", "resolver_output.json"), resolverOutput);

  console.log(`Resolved ${snapshot.resolved_standards.length} standards from ${applicabilityOutput.matched_packs.length} packs`);
}
