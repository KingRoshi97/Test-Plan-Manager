import { join } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { CompletionReport } from "./completion.js";
import type { GateReportV1 } from "../gates/report.js";

export interface VerificationContext {
  run_id: string;
  run_dir: string;
  policy_path?: string;
}

export function runVerification(ctx: VerificationContext): CompletionReport {
  const gatesDir = join(ctx.run_dir, "gates");
  const gateReports: GateReportV1[] = [];

  if (existsSync(gatesDir)) {
    const files = readdirSync(gatesDir).filter((f) => f.endsWith(".gate_report.json"));
    for (const file of files) {
      try {
        const report = readJson<GateReportV1>(join(gatesDir, file));
        gateReports.push(report);
      } catch {
        // skip malformed gate reports
      }
    }
  }

  const gatesTotal = gateReports.length;
  const gatesPassed = gateReports.filter((r) => r.status === "pass").length;
  const failedGates = gateReports.filter((r) => r.status !== "pass").map((r) => r.gate_id);

  const proofDir = join(ctx.run_dir, "proof");
  let proofsCollected = 0;
  if (existsSync(proofDir)) {
    const ledgerPath = join(proofDir, "proof_ledger.jsonl");
    if (existsSync(ledgerPath)) {
      try {
        const lines = readFileSync(ledgerPath, "utf-8").split("\n").filter((l) => l.trim());
        proofsCollected = lines.length;
      } catch {
        // ignore
      }
    }
  }

  const proofsRequired = gatesTotal;
  const missing: string[] = [];

  if (failedGates.length > 0) {
    missing.push(...failedGates.map((g) => `gate:${g}`));
  }

  if (proofsCollected < proofsRequired) {
    missing.push(`proofs:need_${proofsRequired - proofsCollected}_more`);
  }

  const allGatesPassed = gatesPassed === gatesTotal && gatesTotal > 0;
  const proofsSatisfied = proofsCollected >= proofsRequired;

  let verdict: CompletionReport["verdict"];
  if (allGatesPassed && proofsSatisfied) {
    verdict = "complete";
  } else if (failedGates.length > 0) {
    verdict = "blocked";
  } else {
    verdict = "incomplete";
  }

  const notes: string[] = [];
  if (gatesTotal === 0) {
    notes.push("No gate reports found in run directory.");
  }
  notes.push(`Verified ${gatesTotal} gate reports: ${gatesPassed} passed, ${gatesTotal - gatesPassed} failed.`);
  notes.push(`Proofs collected: ${proofsCollected}, required: ${proofsRequired}.`);

  return {
    run_id: ctx.run_id,
    verdict,
    evaluated_at: isoNow(),
    gates_passed: gatesPassed,
    gates_total: gatesTotal,
    proofs_collected: proofsCollected,
    proofs_required: proofsRequired,
    missing,
    notes,
  };
}

export function collectGateReports(runDir: string): GateReportV1[] {
  const gatesDir = join(runDir, "gates");
  const reports: GateReportV1[] = [];

  if (!existsSync(gatesDir)) return reports;

  const files = readdirSync(gatesDir).filter((f) => f.endsWith(".gate_report.json"));
  for (const file of files) {
    try {
      const report = readJson<GateReportV1>(join(gatesDir, file));
      reports.push(report);
    } catch {
      // skip
    }
  }

  return reports;
}
