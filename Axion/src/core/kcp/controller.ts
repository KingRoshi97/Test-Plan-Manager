import { join } from "node:path";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { writeJson } from "../../utils/fs.js";
import type {
  KitRun,
  KitRunStatus,
  KitWorkUnit,
  ImplementationRef,
} from "./model.js";
import { isValidKitRunTransition } from "./model.js";
import type { KitRunStore } from "./store.js";
import { JSONKitRunStore } from "./store.js";
import { validateKitIntegrity } from "./validator.js";
import {
  loadPlanUnits,
  createWorkUnits,
  enforceOneTargetRule,
  getNextUnit,
  buildUnitStatusIndex,
} from "./unitManager.js";
import {
  runAllVerifications,
  type VerificationCommand,
} from "./verificationRunner.js";
import {
  buildUnitResult,
  writeUnitResult,
  type UnitResult,
} from "./resultWriter.js";
import {
  captureProofsFromVerifications,
  writeProofObjects,
  appendToProofLedger,
} from "./proofCapture.js";
import {
  checkForbiddenPaths,
  checkCommandAllowlist,
  buildGuardrailReport,
  type GuardrailConfig,
} from "./guardrails.js";
import { buildKitRunReport } from "./runReport.js";
import { readJson } from "../../utils/fs.js";

export class KitController {
  private readonly store: KitRunStore;
  private readonly kitPath: string;
  private readonly outputDir: string;

  constructor(kitPath: string, outputDir?: string) {
    this.kitPath = kitPath;
    this.outputDir = outputDir ?? kitPath;
    this.store = new JSONKitRunStore(this.outputDir);
  }

  startKitRun(kitPath?: string): KitRun {
    const effectivePath = kitPath ?? this.kitPath;
    const kitRunId = `KITRUN-${sha256(`${effectivePath}_${isoNow()}`).slice(0, 12)}`;

    const validationReport = validateKitIntegrity(effectivePath, kitRunId);

    const validationOutputPath = join(this.outputDir, ".kcp", "reports", `${kitRunId}_validation.json`);
    writeJson(validationOutputPath, validationReport);

    if (!validationReport.valid) {
      const run: KitRun = {
        kit_run_id: kitRunId,
        kit_manifest_ref: join(effectivePath, "kit_manifest.json"),
        status: "blocked",
        units: [],
        verification_results: [],
        guardrail_report_ref: null,
        created_at: isoNow(),
        updated_at: isoNow(),
      };
      this.store.create(run);
      return run;
    }

    let units: KitWorkUnit[] = [];
    try {
      const workBreakdownPath = join(
        effectivePath,
        "bundle",
        "agent_kit",
        "01_core_artifacts",
        "04_work_breakdown.json",
      );
      const workBreakdown = readJson<Record<string, unknown>>(workBreakdownPath);
      const planUnits = loadPlanUnits(workBreakdown);

      const targetViolations = enforceOneTargetRule(planUnits);
      if (targetViolations.length > 0) {
        const run: KitRun = {
          kit_run_id: kitRunId,
          kit_manifest_ref: join(effectivePath, "kit_manifest.json"),
          status: "blocked",
          units: [],
          verification_results: [],
          guardrail_report_ref: null,
          created_at: isoNow(),
          updated_at: isoNow(),
        };
        this.store.create(run);
        return run;
      }

      units = createWorkUnits(planUnits);
    } catch {
      units = [];
    }

    const run: KitRun = {
      kit_run_id: kitRunId,
      kit_manifest_ref: join(effectivePath, "kit_manifest.json"),
      status: "executing",
      units,
      verification_results: [],
      guardrail_report_ref: null,
      created_at: isoNow(),
      updated_at: isoNow(),
    };

    this.store.create(run);
    return run;
  }

  advanceUnit(
    kitRunId: string,
    unitId: string,
    implementationRefs: ImplementationRef[] = [],
    verificationCommands?: VerificationCommand[],
  ): KitRun {
    const run = this.store.get(kitRunId);
    if (!run) {
      throw new Error(`Kit run not found: ${kitRunId}`);
    }

    if (run.status !== "executing") {
      throw new Error(
        `Cannot advance unit in status "${run.status}": must be "executing"`,
      );
    }

    const unit = run.units.find((u) => u.unit_id === unitId);
    if (!unit) {
      throw new Error(`Work unit not found: ${unitId} in run ${kitRunId}`);
    }

    if (unit.status !== "not_started" && unit.status !== "in_progress") {
      throw new Error(
        `Cannot advance unit "${unitId}" in status "${unit.status}"`,
      );
    }

    unit.status = "in_progress";
    unit.attempt_history.push({
      attempt_id: `attempt_${unit.attempt_history.length + 1}`,
      started_at: isoNow(),
      finished_at: null,
      status: "in_progress",
    });

    unit.implementation_refs.push(...implementationRefs);

    const verificationResult = runAllVerifications(
      kitRunId,
      this.outputDir,
      verificationCommands,
    );

    unit.verification_results.push(...verificationResult.results);

    const proofs = captureProofsFromVerifications(
      kitRunId,
      unitId,
      verificationResult.results,
    );

    const proofsDir = join(this.outputDir, ".kcp", "proofs");
    const proofRefs = writeProofObjects(proofsDir, proofs);
    unit.proof_refs.push(...proofRefs);

    const ledgerPath = join(this.outputDir, ".kcp", "proof_ledger.jsonl");
    appendToProofLedger(ledgerPath, proofs);

    if (verificationResult.all_passed && implementationRefs.length > 0) {
      unit.status = "done";
    } else if (!verificationResult.all_passed) {
      unit.status = "failed";
    } else {
      unit.status = "done";
    }

    const currentAttempt = unit.attempt_history[unit.attempt_history.length - 1];
    currentAttempt.finished_at = isoNow();
    currentAttempt.status = unit.status;

    const result = buildUnitResult(
      kitRunId,
      unitId,
      unit.status === "done" ? "done" : "failed",
      unit.implementation_refs,
      unit.proof_refs,
      unit.verification_results,
    );

    const resultsDir = join(this.outputDir, ".kcp", "results");
    writeUnitResult(resultsDir, result);

    run.updated_at = isoNow();
    this.store.update(run);

    return run;
  }

  completeKitRun(kitRunId: string): KitRun {
    const run = this.store.get(kitRunId);
    if (!run) {
      throw new Error(`Kit run not found: ${kitRunId}`);
    }

    const allDone = run.units.every(
      (u) => u.status === "done" || u.status === "skipped",
    );

    if (!allDone) {
      const pending = run.units.filter(
        (u) => u.status !== "done" && u.status !== "skipped",
      );
      throw new Error(
        `Cannot complete kit run: ${pending.length} units not done/skipped: ${pending.map((u) => u.unit_id).join(", ")}`,
      );
    }

    const guardrailViolations = checkForbiddenPaths(
      run.units.flatMap((u) => u.implementation_refs.map((r) => r.path)),
    );
    const guardrailReport = buildGuardrailReport(kitRunId, guardrailViolations);

    const guardrailPath = join(
      this.outputDir,
      ".kcp",
      "reports",
      `${kitRunId}_guardrails.json`,
    );
    writeJson(guardrailPath, guardrailReport);
    run.guardrail_report_ref = guardrailPath;

    if (!guardrailReport.passed) {
      this.transitionRun(run, "blocked");
      this.store.update(run);
      return run;
    }

    this.transitionRun(run, "verifying");
    this.store.update(run);

    this.transitionRun(run, "complete");

    const report = buildKitRunReport(run);
    const reportPath = join(
      this.outputDir,
      ".kcp",
      "reports",
      `${kitRunId}_run_report.json`,
    );
    writeJson(reportPath, report);

    run.updated_at = isoNow();
    this.store.update(run);

    return run;
  }

  getKitRunStatus(kitRunId: string): KitRun | null {
    return this.store.get(kitRunId);
  }

  private transitionRun(run: KitRun, to: KitRunStatus): void {
    if (!isValidKitRunTransition(run.status, to)) {
      throw new Error(
        `Invalid KCP transition: "${run.status}" → "${to}"`,
      );
    }
    run.status = to;
    run.updated_at = isoNow();
  }
}
