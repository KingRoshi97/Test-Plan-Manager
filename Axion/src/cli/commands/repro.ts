import { join } from "node:path";
import { existsSync } from "node:fs";
import { selectReproArtifacts } from "../../core/repro/selector.js";
import { buildReproPackage } from "../../core/repro/builder.js";
import type { ReproPackage } from "../../core/repro/builder.js";

export function cmdRepro(runDir: string, outputPath?: string): ReproPackage {
  if (!existsSync(runDir)) {
    console.error(`ERR-REPRO-001: Run directory not found: ${runDir}`);
    process.exit(1);
  }

  const resolvedOutput = outputPath ?? join(runDir, "..", "repro_output");

  console.log(`[repro] Selecting artifacts from: ${runDir}`);
  const selection = selectReproArtifacts(runDir, { minimal: true });

  console.log(`[repro] Selected ${selection.selected_artifacts.length} artifacts (${selection.excluded_artifacts.length} excluded)`);

  console.log(`[repro] Building repro package at: ${resolvedOutput}`);
  const pkg = buildReproPackage(runDir, resolvedOutput, selection);

  console.log(`[repro] Repro package created:`);
  console.log(`  repro_id:   ${pkg.repro_id}`);
  console.log(`  run_id:     ${pkg.run_id}`);
  console.log(`  artifacts:  ${pkg.artifacts_included}`);
  console.log(`  hash:       ${pkg.content_hash}`);
  console.log(`  output:     ${pkg.output_path}`);

  return pkg;
}
