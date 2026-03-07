import { join } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";
import { cmdInit } from "./commands/initAxion.js";
import { cmdRunStart, cmdRunFull } from "./commands/runControlPlane.js";
import { cmdRunStage } from "./commands/runStage.js";
import { cmdRunGates } from "./commands/runGates.js";
import { cmdBuild } from "./commands/build.js";
import { runMusCommand } from "./commands/mus.js";

function resolveBaseDir(): string {
  if (existsSync("registries")) return ".";
  if (existsSync("Axion/registries")) return "Axion";
  return ".";
}

const USAGE = `
axion — Axion CLI

Usage:
  axion init                                  Initialize .axion/ directory
  axion run                                   Full run: init + start + all stages (ICP control plane)
  axion run start                             Create a new run (allocate RUN-NNNNNN)
  axion run stage <run_id> <stage_id>         Execute a single stage for a run
  axion run gates <run_id> <stage_id>         Run gates for a stage
  axion build --run <run_id> --mode <mode>     Build repo from completed run
  axion mus <subcommand>                      Maintenance & Updating System
  axion help                                  Show this help message

Pipeline Stages (Mechanics order):
  S1_INGEST_NORMALIZE, S2_VALIDATE_INTAKE, S3_BUILD_CANONICAL,
  S4_VALIDATE_CANONICAL, S5_RESOLVE_STANDARDS, S6_SELECT_TEMPLATES,
  S7_RENDER_DOCS, S8_BUILD_PLAN, S9_VERIFY_PROOF, S10_PACKAGE

Gate Registry (stage → gate):
  S2_VALIDATE_INTAKE      → G1_INTAKE_VALIDITY
  S4_VALIDATE_CANONICAL   → G2_CANONICAL_INTEGRITY
  S5_RESOLVE_STANDARDS    → G3_STANDARDS_RESOLVED
  S6_SELECT_TEMPLATES     → G4_TEMPLATE_SELECTION
  S7_RENDER_DOCS          → G5_TEMPLATE_COMPLETENESS
  S8_BUILD_PLAN           → G6_PLAN_COVERAGE
  S9_VERIFY_PROOF         → G7_VERIFICATION (not enforced yet)
  S10_PACKAGE             → G8_PACKAGE_INTEGRITY

Build Modes:
  kit_only          — No build, kit already available
  build_repo        — Generate project repo from kit
  build_and_export  — Generate repo and create zip archive

Control Planes:
  ICP — Internal Control Plane (orchestrates pipeline)
  KCP — Kit Control Plane (enforces kit-local rules)
  MCP — Maintenance Control Plane (handles upgrades/migrations)
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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  const baseDir = resolveBaseDir();

  switch (command) {
    case "init": {
      cmdInit(baseDir);
      break;
    }

    case "run": {
      const subCommand = args[1];

      if (subCommand === "start") {
        cmdInit(baseDir);
        console.log("\n[run start] Creating new run via ICP...");
        const runId = await cmdRunStart(baseDir);
        console.log(`  Run ID: ${runId}`);

      } else if (subCommand === "stage") {
        const runId = args[2];
        const stageId = args[3];
        if (!runId || !stageId) {
          console.error("Usage: axion run stage <run_id> <stage_id>");
          process.exit(1);
        }
        await cmdRunStage(baseDir, runId, stageId);

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
        await cmdRunFull(baseDir);

        const runDir = join(baseDir, ".axion", "runs");
        const runs = readdirSync(runDir).filter((d) => d.startsWith("RUN-")).sort();
        const lastRunDir = join(runDir, runs[runs.length - 1]);

        console.log("\nArtifact listing:");
        for (const entry of walk(lastRunDir, lastRunDir)) {
          console.log(`  ${entry}`);
        }
      }
      break;
    }

    case "build": {
      let runId = "";
      let mode = "build_and_export";
      for (let i = 1; i < args.length; i++) {
        if (args[i] === "--run" && args[i + 1]) {
          runId = args[++i];
        } else if (args[i] === "--mode" && args[i + 1]) {
          mode = args[++i];
        }
      }
      if (!runId) {
        console.error("Usage: axion build --run <run_id> --mode <mode>");
        process.exit(1);
      }
      await cmdBuild(runId, mode);
      break;
    }

    case "mus": {
      await runMusCommand(args.slice(1));
      break;
    }

    case "help":
    default: {
      console.log(USAGE);
      break;
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message || err);
  process.exit(1);
});
