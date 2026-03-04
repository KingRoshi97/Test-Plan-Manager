import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { cmdInit } from "./commands/initAxion.js";
import { cmdRunStart } from "./commands/runControlPlane.js";
import { cmdRunStage } from "./commands/runStage.js";
import { cmdRunGates } from "./commands/runGates.js";
import { STAGE_ORDER } from "../types/run.js";
import { AuditLogger } from "../core/controlPlane/audit.js";
import { appendRunLogEntry } from "../core/controlPlane/outputs.js";

const USAGE = `
axion — Axion CLI

Usage:
  axion init                                  Initialize .axion/ directory
  axion run                                   Full run: init + start + all stages
  axion run start                             Create a new run (allocate RUN-NNNNNN)
  axion run stage <run_id> <stage_id>         Execute a single stage for a run
  axion run gates <run_id> <stage_id>         Run gates for a stage
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

        const auditLogger = new AuditLogger(join(runDir, "audit_log.jsonl"));
        auditLogger.logOperatorAction({
          action_type: "start_run",
          run_id: runId,
          operator_id: "cli",
          details: { trigger: "cli", mode: "full_run" },
          timestamp: new Date().toISOString(),
        });
        appendRunLogEntry(runDir, runId, "info", "Run started via CLI full run");

        console.log(`\n[2/2] Executing ${STAGE_ORDER.length} stages...`);
        for (const stageId of STAGE_ORDER) {
          appendRunLogEntry(runDir, runId, "stage_start", `Starting stage ${stageId}`, {}, stageId);
          cmdRunStage(baseDir, runId, stageId);
          appendRunLogEntry(runDir, runId, "stage_end", `Completed stage ${stageId}`, {}, stageId);
        }

        auditLogger.logOperatorAction({
          action_type: "release_bundle",
          run_id: runId,
          operator_id: "cli",
          details: { trigger: "cli", result: "completed" },
          timestamp: new Date().toISOString(),
        });
        appendRunLogEntry(runDir, runId, "info", "Run completed successfully");

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
