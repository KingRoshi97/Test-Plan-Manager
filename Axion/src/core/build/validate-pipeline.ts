import * as path from "path";
import { fileURLToPath } from "url";
import { extractKit, checkExtractionGate } from "./extractor";
import { buildRepoBlueprint, checkBlueprintGate } from "./blueprint";
import { createBuildPlan } from "./planner";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AXION_ROOT = path.resolve(__dirname, "../../../.axion");

async function main() {
  const runId = process.argv[2] ?? "RUN-000036";
  const runDir = path.join(AXION_ROOT, "runs", runId);

  console.log(`\n========================================`);
  console.log(`  PIPELINE VALIDATION: ${runId}`);
  console.log(`========================================\n`);

  console.log(`[1/4] EXTRACTION`);
  console.log(`-----------------`);
  let extraction;
  try {
    extraction = await extractKit(runDir);
    const gate = checkExtractionGate(extraction);

    console.log(`  Kit files:       ${extraction.kit_file_count}`);
    console.log(`  Layers found:    ${extraction.source_layer_results.filter(l => l.extracted).length} / ${extraction.source_layer_results.length}`);
    console.log(`  Extracted files: ${extraction.extraction_coverage_summary.total_extracted_files}`);
    console.log(`  Ignored files:   ${extraction.extraction_coverage_summary.total_ignored_files}`);
    console.log(`  Entities:        ${extraction.derived_inputs.domain_model?.entities?.length ?? 0}`);
    console.log(`  Modules:         ${extraction.derived_inputs.subsystems?.length ?? 0}`);
    console.log(`  Endpoints:       ${extraction.derived_build_implications.derived_endpoint_count ?? 0}`);
    console.log(`  Gate:            ${gate.passed ? "PASSED" : "FAILED"}`);
    if (gate.blockers.length > 0) {
      console.log(`  Blockers:        ${gate.blockers.join(", ")}`);
    }
    console.log(`  Result:          ${extraction.extraction_result}`);

    for (const layer of extraction.source_layer_results) {
      const status = layer.extracted ? `OK (${layer.extracted_count} files)` : `MISS${layer.required ? " [REQUIRED]" : ""}`;
      console.log(`    ${(layer.source_layer ?? "unknown").padEnd(25)} ${status}`);
    }

    if (!gate.passed) {
      console.log(`\n  [WARN] Extraction gate did not pass — blueprint may still work with partial data`);
    }
  } catch (err: any) {
    console.log(`  EXTRACTION FAILED: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n[2/4] BLUEPRINT`);
  console.log(`-----------------`);
  let blueprint;
  try {
    blueprint = await buildRepoBlueprint(extraction, runDir);
    const gate = checkBlueprintGate(blueprint);

    console.log(`  File inventory:  ${blueprint.file_inventory.length}`);
    console.log(`  Modules:         ${blueprint.module_map.length}`);
    console.log(`  Directories:     ${blueprint.directory_layout.directories?.length ?? 0}`);
    console.log(`  Expected files:  ${blueprint.expected_file_count}`);
    console.log(`  Gate:            ${gate.passed ? "PASSED" : "FAILED"}`);
    if (gate.blockers.length > 0) {
      console.log(`  Blockers:        ${gate.blockers.join(", ")}`);
    }

    if (blueprint.file_count_breakdown) {
      console.log(`  Breakdown:`);
      for (const [key, val] of Object.entries(blueprint.file_count_breakdown)) {
        if (typeof val === "number" && val > 0) {
          console.log(`    ${key.padEnd(25)} ${val}`);
        }
      }
    }
  } catch (err: any) {
    console.log(`  BLUEPRINT FAILED: ${err.message}`);
    console.log(`  Stack: ${err.stack?.split("\n").slice(0, 3).join("\n    ")}`);
    blueprint = undefined;
  }

  console.log(`\n[3/4] PLAN (Blueprint-driven)`);
  console.log(`-----------------------------`);
  let blueprintPlanFileCount = 0;
  try {
    const plan = await createBuildPlan(runDir, blueprint);
    blueprintPlanFileCount = plan.slices.reduce((acc, s) => acc + s.files.length, 0);
    console.log(`  Slices:          ${plan.slices.length}`);
    console.log(`  Total files:     ${blueprintPlanFileCount}`);
    console.log(`  AI-assisted:     ${plan.slices.reduce((a, s) => a + s.files.filter(f => f.generationMethod === "ai_assisted").length, 0)}`);
    console.log(`  Deterministic:   ${plan.slices.reduce((a, s) => a + s.files.filter(f => f.generationMethod === "deterministic").length, 0)}`);

    const roleCounts: Record<string, number> = {};
    for (const s of plan.slices) {
      for (const f of s.files) {
        roleCounts[f.role] = (roleCounts[f.role] ?? 0) + 1;
      }
    }
    console.log(`  Role distribution:`);
    for (const [role, count] of Object.entries(roleCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${role.padEnd(25)} ${count}`);
    }
  } catch (err: any) {
    console.log(`  PLAN FAILED: ${err.message}`);
  }

  console.log(`\n[4/4] PLAN (Legacy fallback)`);
  console.log(`-----------------------------`);
  try {
    const legacyPlan = await createBuildPlan(runDir, undefined);
    const legacyFileCount = legacyPlan.slices.reduce((acc, s) => acc + s.files.length, 0);
    console.log(`  Slices:          ${legacyPlan.slices.length}`);
    console.log(`  Total files:     ${legacyFileCount}`);

    if (blueprintPlanFileCount > 0) {
      const improvement = ((blueprintPlanFileCount - legacyFileCount) / legacyFileCount * 100).toFixed(1);
      console.log(`\n  COMPARISON:`);
      console.log(`    Legacy:        ${legacyFileCount} files`);
      console.log(`    Blueprint:     ${blueprintPlanFileCount} files`);
      console.log(`    Improvement:   ${improvement}%`);
    }
  } catch (err: any) {
    console.log(`  LEGACY PLAN FAILED: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`  VALIDATION COMPLETE`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("Validation script failed:", err);
  process.exit(1);
});
