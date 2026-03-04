import { reproduceRun } from "../../core/repro/builder.js";

export function cmdRepro(runId: string, outputPath?: string, baseDir: string = "."): void {
  console.log(`[repro] Reproducing run ${runId}...`);

  const { reproPackage, comparison } = reproduceRun(baseDir, runId, outputPath);

  console.log(`[repro] Repro package created: ${reproPackage.repro_id}`);
  console.log(`[repro] Artifacts included: ${reproPackage.artifacts_included}`);
  console.log(`[repro] Output: ${reproPackage.output_path}`);

  if (comparison) {
    console.log(`\n[repro] Comparison result:`);
    console.log(`  Deterministic: ${comparison.deterministic}`);
    console.log(`  Matches: ${comparison.matches.length}`);
    console.log(`  Mismatches: ${comparison.mismatches.length}`);
    console.log(`  Missing in replay: ${comparison.missing_in_replay.length}`);

    if (comparison.mismatches.length > 0) {
      console.log(`\n  Mismatched artifacts:`);
      for (const m of comparison.mismatches) {
        console.log(`    ${m.path}: ${m.diff_summary}`);
      }
    }
  }

  console.log(`\n[repro] Done.`);
}
