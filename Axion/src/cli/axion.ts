import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { cmdInit } from "./commands/initAxion.js";
import { cmdRunStart } from "./commands/runControlPlane.js";
import { cmdRunStage } from "./commands/runStage.js";
import { cmdRunGates } from "./commands/runGates.js";
import { STAGE_ORDER } from "../types/run.js";

const USAGE = `
axion — Axion CLI

Usage:
  axion init                                  Initialize .axion/ directory
  axion run                                   Full run: init + start + all stages
  axion run start                             Create a new run (allocate RUN-NNNNNN)
  axion run stage <run_id> <stage_id>         Execute a single stage for a run
  axion run gates <run_id> <stage_id>         Run gates for a stage (gate registry stage_id)
  axion help                                  Show this help message

Pipeline Stages (in order):
  S0_INIT, S1_INGEST_NORMALIZE, S2_INTAKE_VALIDATION,
  S3_STANDARDS_RESOLUTION, S4_CANONICAL_BUILD, S5_TEMPLATE_SELECTION,
  S6_PLAN_GENERATION, S7_TEMPLATE_FILL, S8_GATE_EVALUATION,
  S9_KIT_PACKAGE, S10_CLOSE

Gate Registry Stages:
  S2_VALIDATE_INTAKE, S4_VALIDATE_CANONICAL, S5_RESOLVE_STANDARDS,
  S8_BUILD_PLAN, S10_PACKAGE
`;

function walk(base: string, current: string): string[] {
  const results: string[] = [];
  for (const name of readdirSync(current)) {
    const full = join(current, name);
    const rel = full.slice(base.length + 1);
    if (statSync(full).isDirectory()) {
      results.push(rel + "/");
      results.push(...walk(base, full));
    } else {
      results.push(rel);
    }
  }
  return results;
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const baseDir = ".";

  switch (command) {
    case "init": {
      cmdInit(baseDir);
      break;
    }

    case "run": {
      const subCommand = args[1];

      if (subCommand === "start") {
        cmdInit(baseDir);
        console.log("\n[run start] Creating new run...");
        cmdRunStart(baseDir);

      } else if (subCommand === "stage") {
        const runId = args[2];
        const stageId = args[3];
        if (!runId || !stageId) {
          console.error("Usage: axion run stage <run_id> <stage_id>");
          process.exit(1);
        }
        cmdRunStage(baseDir, runId, stageId);

      } else if (subCommand === "gates") {
        const runId = args[2];
        const stageId = args[3];
        if (!runId || !stageId) {
          console.error("Usage: axion run gates <run_id> <stage_id>");
          process.exit(1);
        }
        cmdRunGates(baseDir, runId, stageId);

      } else {
        cmdInit(baseDir);

        console.log("\n[1/2] Creating new run...");
        const runId = cmdRunStart(baseDir);
        const runDir = join(baseDir, ".axion", "runs", runId);

        const runnableStages = STAGE_ORDER.filter((s) => s !== "S0_INIT");
        console.log(`\n[2/2] Executing ${runnableStages.length} stages...`);
        for (const stageId of runnableStages) {
          cmdRunStage(baseDir, runId, stageId);
        }

        console.log(`\nDone. Full artifact spine written to: ${runDir}`);
        console.log("\nArtifact listing:");
        for (const entry of walk(runDir, runDir)) {
          console.log(`  ${entry}`);
        }
      }
      break;
    }

    case "help":
    default: {
      console.log(USAGE);
      break;
    }
  }
}

main();
