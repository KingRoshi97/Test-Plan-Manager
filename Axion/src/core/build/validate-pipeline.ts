import * as path from "path";
import { fileURLToPath } from "url";
import { extractKit, checkExtractionGate } from "./extractor.js";
import { buildRepoBlueprint, checkBlueprintGate } from "./blueprint.js";
import { createBuildPlan } from "./planner.js";
import { runGSE } from "./gse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AXION_ROOT = path.resolve(__dirname, "../../../.axion");

async function main() {
  const runId = process.argv[2] ?? "RUN-000036";
  const runDir = path.join(AXION_ROOT, "runs", runId);

  console.log(`\n========================================`);
  console.log(`  PIPELINE VALIDATION: ${runId}`);
  console.log(`========================================\n`);

  console.log(`[1/5] EXTRACTION`);
  console.log(`-----------------`);
  let extraction;
  try {
    extraction = await extractKit(runDir);
    const gate = checkExtractionGate(extraction);

    console.log(`  Kit files:       ${extraction.kit_file_count}`);
    console.log(`  Layers found:    ${extraction.source_layer_results.filter((l: any) => l.extracted).length} / ${extraction.source_layer_results.length}`);
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

  console.log(`\n[2/5] BLUEPRINT`);
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

    if (blueprint.build_profile) {
      const bp = blueprint.build_profile;
      console.log(`  Build profile:   ${bp.profile} (verification=${bp.verification_depth}, ops=${bp.ops_tier}, contracts=${bp.contract_tier}, persistence=${bp.persistence_tier})`);
    }

    if (blueprint.file_count_breakdown) {
      console.log(`  Breakdown:`);
      for (const [key, val] of Object.entries(blueprint.file_count_breakdown)) {
        if (typeof val === "number" && val > 0) {
          console.log(`    ${key.padEnd(25)} ${val}`);
        }
      }
    }

    const justificationCounts: Record<string, number> = {};
    let filesWithReason = 0;
    for (const f of blueprint.file_inventory) {
      if (f.justification) {
        justificationCounts[f.justification] = (justificationCounts[f.justification] ?? 0) + 1;
      }
      if (f.required_reason) filesWithReason++;
    }
    if (Object.keys(justificationCounts).length > 0) {
      console.log(`  Justification breakdown:`);
      for (const [key, val] of Object.entries(justificationCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${key.padEnd(25)} ${val}`);
      }
      console.log(`  Files with reason:  ${filesWithReason}/${blueprint.file_inventory.length}`);
    }
  } catch (err: any) {
    console.log(`  BLUEPRINT FAILED: ${err.message}`);
    console.log(`  Stack: ${err.stack?.split("\n").slice(0, 3).join("\n    ")}`);
    blueprint = undefined;
  }

  console.log(`\n[3/5] PLAN (Blueprint-driven)`);
  console.log(`-----------------------------`);
  let plan;
  let blueprintPlanFileCount = 0;
  try {
    plan = await createBuildPlan(runDir, blueprint);
    blueprintPlanFileCount = plan.slices.reduce((acc: number, s: any) => acc + s.files.length, 0);
    console.log(`  Slices:          ${plan.slices.length}`);
    console.log(`  Total files:     ${blueprintPlanFileCount}`);
    console.log(`  AI-assisted:     ${plan.slices.reduce((a: number, s: any) => a + s.files.filter((f: any) => f.generationMethod === "ai_assisted").length, 0)}`);
    console.log(`  Deterministic:   ${plan.slices.reduce((a: number, s: any) => a + s.files.filter((f: any) => f.generationMethod === "deterministic").length, 0)}`);

    const roleCounts: Record<string, number> = {};
    for (const s of plan.slices) {
      for (const f of (s as any).files) {
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

  console.log(`\n[4/5] PLAN (Legacy fallback)`);
  console.log(`-----------------------------`);
  try {
    const legacyPlan = await createBuildPlan(runDir, undefined);
    const legacyFileCount = legacyPlan.slices.reduce((acc: number, s: any) => acc + s.files.length, 0);
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

  console.log(`\n[5/5] GSE STRATEGY`);
  console.log(`-----------------------------`);
  if (blueprint && plan) {
    try {
      const gsePlan = await runGSE(blueprint, plan, runDir);

      const unitTypeCounts: Record<string, number> = {};
      for (const u of gsePlan.build_units) {
        unitTypeCounts[u.unit_type] = (unitTypeCounts[u.unit_type] ?? 0) + 1;
      }
      console.log(`  Build units:     ${gsePlan.build_units.length}`);
      console.log(`  Units by type:`);
      for (const [type, count] of Object.entries(unitTypeCounts).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${type.padEnd(25)} ${count}`);
      }

      const classCounts: Record<string, number> = { C0: 0, C1: 0, C2: 0, C3: 0, C4: 0 };
      for (const p of gsePlan.complexity_profiles) {
        classCounts[p.complexity_class] = (classCounts[p.complexity_class] ?? 0) + 1;
      }
      const totalUnits = gsePlan.build_units.length;
      console.log(`  Complexity distribution:`);
      for (const [cls, count] of Object.entries(classCounts)) {
        const pct = totalUnits > 0 ? ((count / totalUnits) * 100).toFixed(1) : "0.0";
        console.log(`    ${cls.padEnd(25)} ${count} (${pct}%)`);
      }

      const modeCounts: Record<string, number> = {};
      for (const s of gsePlan.strategies) {
        modeCounts[s.generation_mode] = (modeCounts[s.generation_mode] ?? 0) + 1;
      }
      console.log(`  Mode distribution (units):`);
      for (const [mode, count] of Object.entries(modeCounts).sort((a, b) => b[1] - a[1])) {
        const pct = totalUnits > 0 ? ((count / totalUnits) * 100).toFixed(1) : "0.0";
        console.log(`    ${mode.padEnd(25)} ${count} (${pct}%)`);
      }

      const cf = gsePlan.cost_forecast;
      console.log(`  File mode distribution:`);
      for (const [mode, data] of Object.entries(cf.by_mode)) {
        if (data.file_count > 0) {
          const pct = blueprintPlanFileCount > 0 ? ((data.file_count / blueprintPlanFileCount) * 100).toFixed(1) : "0.0";
          console.log(`    ${mode.padEnd(25)} ${data.file_count} files (${pct}%)`);
        }
      }

      console.log(`  Waves:           ${gsePlan.wave_plan.waves.length}`);
      for (const w of gsePlan.wave_plan.waves) {
        console.log(`    ${w.wave_id.padEnd(25)} ${w.unit_ids.length} units`);
      }

      console.log(`  Cost forecast:`);
      console.log(`    Total tokens:  ~${cf.total_estimated_tokens.toLocaleString()}`);
      console.log(`    Est. cost:     $${cf.estimated_cost_usd}`);

      const deterministicFiles = cf.by_mode.deterministic.file_count;
      const deterministicPct = blueprintPlanFileCount > 0 ? ((deterministicFiles / blueprintPlanFileCount) * 100).toFixed(1) : "0.0";
      const llmFiles = (cf.by_mode.cheap_model?.file_count ?? 0) + (cf.by_mode.full_model?.file_count ?? 0);
      const llmPct = blueprintPlanFileCount > 0 ? ((llmFiles / blueprintPlanFileCount) * 100).toFixed(1) : "0.0";
      console.log(`  LLM usage:       ${llmFiles} files (${llmPct}%)`);
      console.log(`  Deterministic:   ${deterministicFiles} files (${deterministicPct}%)`);

      const totalCovered = gsePlan.build_units.reduce((a, u) => a + u.file_ids.length, 0);
      const orphans = blueprintPlanFileCount - totalCovered;
      console.log(`  Coverage:        ${totalCovered}/${blueprintPlanFileCount} files covered (${orphans} orphans)`);
    } catch (err: any) {
      console.log(`  GSE FAILED: ${err.message}`);
      console.log(`  Stack: ${err.stack?.split("\n").slice(0, 3).join("\n    ")}`);
    }
  } else {
    console.log(`  SKIPPED: Blueprint or plan not available`);
  }

  console.log(`\n========================================`);
  console.log(`  VALIDATION COMPLETE`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("Validation script failed:", err);
  process.exit(1);
});
