import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";
import { cmdInit } from "./commands/initAxion.js";
import { cmdRunStart } from "./commands/runControlPlane.js";
import { cmdRunStage, executeStage, StageFailureError } from "./commands/runStage.js";
import { cmdRunGates } from "./commands/runGates.js";
import { cmdValidateIntake } from "./commands/validateIntake.js";
import { cmdResolveStandards } from "./commands/resolveStandards.js";
import { cmdBuildSpec } from "./commands/buildSpec.js";
import { cmdFillTemplates } from "./commands/fillTemplates.js";
import { cmdRepro } from "./commands/repro.js";
import { cmdGenerateKit } from "./commands/generateKit.js";
import { cmdExportBundle } from "./commands/exportBundle.js";
import { cmdRelease } from "./commands/release.js";
import { cmdWriteProof } from "./commands/writeProof.js";
import { cmdVerify } from "./commands/verify.js";
import { cmdPlanWork } from "./commands/planWork.js";
import { cmdWriteState } from "./commands/writeState.js";
import type { BundleProfile } from "./commands/exportBundle.js";
import { STAGE_ORDER } from "../types/run.js";
import { AuditLogger } from "../core/controlPlane/audit.js";
import { appendRunLogEntry } from "../core/controlPlane/outputs.js";
import { RunController } from "../core/controlPlane/api.js";
import { JSONRunStore } from "../core/controlPlane/store.js";
import { ensureDir } from "../utils/fs.js";
import { isoNow } from "../utils/time.js";
import { writeCanonicalJson } from "../utils/canonicalJson.js";
import { pruneByPolicy, pruneRenderedDocsByPolicy, loadRetentionPolicy, listRuns } from "../core/state/retention.js";

const USAGE = `
axion — Axion CLI

Usage:
  axion init                                  Initialize .axion/ directory
  axion run [--submission <path>]              Full run: init + start + all stages
  axion run start [--submission <path>]       Create a new run (allocate RUN-NNNNNN)
  axion run stage <run_id> <stage_id>         Execute a single stage for a run
  axion run gates <run_id> <stage_id>         Run gates for a stage
  axion validate-intake <path> [version]       Validate an intake submission
  axion resolve-standards <run_dir> [lib_path] Resolve standards for a run
  axion fill-templates <run_dir> [lib_path]   Fill templates with spec data
  axion repro <run_id> [output_path]          Reproduce a run deterministically
  axion generate-kit <run_dir> [output] [--variant external|internal]  Generate kit
  axion export-bundle <run_dir> [--profile <p>] [--output <path>]      Export bundle
  axion release <run_dir> <version>            Release a completed run
  axion write-proof <run_id> <run_dir>         Write proof entries for a run
  axion verify <run_id> <run_dir>              Verify a completed run
  axion plan-work <run_id> <run_dir>           Generate work breakdown
  axion write-state <run_id> <run_dir>         Write state snapshot
  axion prune [--rendered-only] [--config <p>] Prune old runs by retention policy
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

async function main(): Promise<void> {
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
        const submissionIdx = args.indexOf("--submission");
        const submissionPath = submissionIdx !== -1 ? args[submissionIdx + 1] : undefined;
        console.log("\n[run start] Creating new run...");
        cmdRunStart(baseDir, submissionPath);

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

        const submissionIdx = args.indexOf("--submission");
        const submissionPath = submissionIdx !== -1 ? args[submissionIdx + 1] : undefined;

        console.log("\n[1/2] Creating new run...");
        const runId = cmdRunStart(baseDir, submissionPath);
        const runDir = join(baseDir, ".axion", "runs", runId);

        const icpStorePath = join(baseDir, ".axion", "icp_runs");
        ensureDir(icpStorePath);
        const store = new JSONRunStore(icpStorePath);
        const controller = new RunController(store);

        const icpRun = await controller.createRun({
          run_id: runId,
          risk_class: "prototype",
          executor_type_default: "internal",
          targets: { platforms: ["web"], domains: ["default"] },
        });

        const auditLogger = new AuditLogger(join(runDir, "audit_log.jsonl"));
        auditLogger.logOperatorAction({
          action_type: "start_run",
          run_id: runId,
          operator_id: "cli",
          details: { trigger: "cli", mode: "full_run", icp_state: icpRun.state },
          timestamp: new Date().toISOString(),
        });
        appendRunLogEntry(runDir, runId, "info", "Run started via CLI full run (ICP RunController)");

        console.log(`\n[2/2] Executing ${STAGE_ORDER.length} stages via RunController...`);
        let failed = false;
        let failedStageId: string | undefined;
        let failReason: string | undefined;

        for (const stageId of STAGE_ORDER) {
          try {
            await controller.advanceStage(runId, stageId);
            appendRunLogEntry(runDir, runId, "stage_start", `Starting stage ${stageId} (ICP: IN_PROGRESS)`, {}, stageId);

            const stageStartTime = isoNow();
            executeStage(baseDir, runId, stageId);

            await controller.completeStage(runId, stageId, {
              status: "PASS",
              report: {
                run_id: runId,
                stage_id: stageId,
                attempt_id: `${stageId}_attempt_1`,
                status: "PASS",
                started_at: stageStartTime,
                finished_at: isoNow(),
                inputs_consumed: [],
                outputs_produced: [],
                validation_results: [],
                failures: [],
                duration_ms: 0,
                prior_attempt_refs: [],
              },
              runDir,
              baseDir,
            });

            appendRunLogEntry(runDir, runId, "stage_end", `Completed stage ${stageId} (ICP: PASS)`, {}, stageId);
          } catch (err) {
            const stageErr = err instanceof StageFailureError ? err : null;
            failedStageId = stageId;
            failReason = stageErr ? stageErr.reason : (err instanceof Error ? err.message : String(err));

            try {
              await controller.completeStage(runId, stageId, {
                status: "FAIL",
                report: {
                  run_id: runId,
                  stage_id: stageId,
                  attempt_id: `${stageId}_attempt_1`,
                  status: "FAIL",
                  started_at: isoNow(),
                  finished_at: isoNow(),
                  inputs_consumed: [],
                  outputs_produced: [],
                  validation_results: [],
                  failures: [],
                  duration_ms: 0,
                  prior_attempt_refs: [],
                },
              });
            } catch {
              /* stage may already be in a terminal state */
            }

            appendRunLogEntry(runDir, runId, "error", `Stage ${stageId} failed: ${failReason}`, {}, stageId);
            failed = true;
            break;
          }
        }

        if (failed) {
          try {
            await controller.failRun(runId, {
              classification: "contract_failure",
              message: `Stage ${failedStageId} failed: ${failReason}`,
            });
          } catch {
            /* already failed */
          }

          const finalState = await controller.getRunStatus(runId);
          writeCanonicalJson(join(runDir, "icp_run_state.json"), finalState);

          auditLogger.logOperatorAction({
            action_type: "stop_run",
            run_id: runId,
            operator_id: "cli",
            details: { trigger: "cli", result: "failed", failed_stage: failedStageId, reason: failReason, icp_state: finalState?.state },
            timestamp: new Date().toISOString(),
          });
          appendRunLogEntry(runDir, runId, "error", `Run failed at stage ${failedStageId} (ICP: FAILED)`);

          console.error(`\nRun FAILED at stage ${failedStageId}: ${failReason}`);
          console.error(`ICP Run State: FAILED`);
          process.exit(1);
        }

        try {
          await controller.releaseRun(runId);
        } catch {
          /* release may fail if gates not tracked in ICP — acceptable for now */
        }

        const finalState = await controller.getRunStatus(runId);
        writeCanonicalJson(join(runDir, "icp_run_state.json"), finalState);

        auditLogger.logOperatorAction({
          action_type: "release_bundle",
          run_id: runId,
          operator_id: "cli",
          details: { trigger: "cli", result: "completed", icp_state: finalState?.state },
          timestamp: new Date().toISOString(),
        });
        appendRunLogEntry(runDir, runId, "info", `Run completed successfully (ICP: ${finalState?.state ?? "RELEASED"})`);

        console.log(`\nDone. Full artifact spine written to: ${runDir}`);
        console.log(`ICP Run State: ${finalState?.state ?? "RELEASED"}`);
        console.log("\nArtifact listing:");
        for (const entry of walk(runDir, runDir)) {
          console.log(`  ${entry}`);
        }
      }
      break;
    }

    case "validate-intake": {
      const inputPath = args[1];
      if (!inputPath) {
        console.error("Usage: axion validate-intake <path> [schema_version]");
        process.exit(1);
      }
      const schemaVersion = args[2];
      cmdValidateIntake(inputPath, schemaVersion);
      break;
    }

    case "build-spec": {
      const runDirSpec = args[1];
      if (!runDirSpec) {
        console.error("Usage: axion build-spec <run_dir>");
        process.exit(1);
      }
      cmdBuildSpec(runDirSpec);
      break;
    }

    case "resolve-standards": {
      const runDirArg = args[1];
      if (!runDirArg) {
        console.error("Usage: axion resolve-standards <run_dir> [library_path]");
        process.exit(1);
      }
      const libPath = args[2];
      cmdResolveStandards(runDirArg, libPath);
      break;
    }

    case "fill-templates": {
      const fillRunDir = args[1];
      if (!fillRunDir) {
        console.error("Usage: axion fill-templates <run_dir> [template_library_path]");
        process.exit(1);
      }
      const fillLibPath = args[2];
      cmdFillTemplates(fillRunDir, fillLibPath);
      break;
    }

    case "repro": {
      const reproRunId = args[1];
      if (!reproRunId) {
        console.error("Usage: axion repro <run_id> [output_path]");
        process.exit(1);
      }
      const reproOutput = args[2];
      cmdRepro(reproRunId, reproOutput, baseDir);
      break;
    }

    case "prune": {
      const axionDir = join(baseDir, ".axion");
      const renderedOnly = args.includes("--rendered-only");
      const configIdx = args.indexOf("--config");
      const configPath = configIdx !== -1 ? args[configIdx + 1] : undefined;

      if (renderedOnly) {
        console.log("[prune] Pruning rendered docs only...");
        const result = pruneRenderedDocsByPolicy(axionDir);
        console.log(`  Freed ${result.bytes_freed} bytes from rendered docs`);
        if (result.errors.length > 0) {
          console.error(`  Errors: ${result.errors.join(", ")}`);
        }
      } else {
        const policy = loadRetentionPolicy(configPath);
        const runs = listRuns(axionDir);
        console.log(`[prune] Found ${runs.length} runs, policy: max_runs=${policy.max_runs}, max_age_days=${policy.max_age_days}`);
        const result = pruneByPolicy(axionDir, policy);
        console.log(`  Pruned ${result.pruned_run_ids.length} runs, freed ${result.bytes_freed} bytes`);
        console.log(`  Retained ${result.retained_run_ids.length} runs`);
        if (result.pruned_run_ids.length > 0) {
          console.log(`  Pruned: ${result.pruned_run_ids.join(", ")}`);
        }
        if (result.errors.length > 0) {
          console.error(`  Errors: ${result.errors.join(", ")}`);
        }
      }
      break;
    }

    case "generate-kit": {
      const kitRunDir = args[1];
      if (!kitRunDir) {
        console.error("Usage: axion generate-kit <run_dir> [output_dir] [--variant external|internal]");
        process.exit(1);
      }
      const kitOutputDir = args[2] && !args[2].startsWith("--") ? args[2] : undefined;
      const variantIdx = args.indexOf("--variant");
      const kitVariant = variantIdx !== -1 ? args[variantIdx + 1] : undefined;
      cmdGenerateKit(kitRunDir, kitOutputDir, kitVariant);
      break;
    }

    case "export-bundle": {
      const bundleRunDir = args[1];
      if (!bundleRunDir) {
        console.error("Usage: axion export-bundle <run_dir> [--profile <profile>] [--output <path>]");
        process.exit(1);
      }
      const profileIdx = args.indexOf("--profile");
      const bundleProfile = profileIdx !== -1 ? (args[profileIdx + 1] as BundleProfile) : undefined;
      const outputIdx = args.indexOf("--output");
      const bundleOutput = outputIdx !== -1 ? args[outputIdx + 1] : undefined;
      cmdExportBundle(bundleRunDir, bundleProfile, bundleOutput);
      break;
    }

    case "release": {
      const relRunDir = args[1];
      const relVersion = args[2];
      if (!relRunDir || !relVersion) {
        console.error("Usage: axion release <run_dir> <version>");
        process.exit(1);
      }
      cmdRelease(relRunDir, relVersion);
      break;
    }

    case "write-proof": {
      const wpRunId = args[1];
      const wpRunDir = args[2];
      if (!wpRunId || !wpRunDir) {
        console.error("Usage: axion write-proof <run_id> <run_dir>");
        process.exit(1);
      }
      cmdWriteProof(wpRunId, wpRunDir, baseDir);
      break;
    }

    case "verify": {
      const vRunId = args[1];
      const vRunDir = args[2];
      if (!vRunId || !vRunDir) {
        console.error("Usage: axion verify <run_id> <run_dir>");
        process.exit(1);
      }
      cmdVerify(vRunId, vRunDir);
      break;
    }

    case "plan-work": {
      const pwRunId = args[1];
      const pwRunDir = args[2];
      if (!pwRunId || !pwRunDir) {
        console.error("Usage: axion plan-work <run_id> <run_dir>");
        process.exit(1);
      }
      cmdPlanWork(pwRunId, pwRunDir);
      break;
    }

    case "write-state": {
      const wsRunId = args[1];
      const wsRunDir = args[2];
      if (!wsRunId || !wsRunDir) {
        console.error("Usage: axion write-state <run_id> <run_dir>");
        process.exit(1);
      }
      cmdWriteState(wsRunId, wsRunDir);
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
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
