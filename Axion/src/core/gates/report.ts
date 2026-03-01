import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";

export type GateVerdict = "pass" | "fail" | "skip" | "error";

export interface GateReport {
  gate_id: string;
  version: string;
  run_id: string;
  verdict: GateVerdict;
  evaluated_at: string;
  evidence_refs: string[];
  failures: string[];
  notes: string[];
}

export function createPlaceholderGateReport(gateId: string, runId: string): GateReport {
  return {
    gate_id: gateId,
    version: "0.0.0",
    run_id: runId,
    verdict: "skip",
    evaluated_at: isoNow(),
    evidence_refs: [],
    failures: [],
    notes: ["Placeholder — gate evaluation not yet implemented."],
  };
}

export function writeGateReport(outputPath: string, report: GateReport): void {
  writeJson(outputPath, report);
}
