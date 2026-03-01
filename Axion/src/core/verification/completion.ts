import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";

export type CompletionVerdict = "complete" | "incomplete" | "blocked" | "error";

export interface CompletionReport {
  run_id: string;
  verdict: CompletionVerdict;
  evaluated_at: string;
  gates_passed: number;
  gates_total: number;
  proofs_collected: number;
  proofs_required: number;
  missing: string[];
  notes: string[];
}

export function createPlaceholderCompletionReport(runId: string): CompletionReport {
  return {
    run_id: runId,
    verdict: "incomplete",
    evaluated_at: isoNow(),
    gates_passed: 0,
    gates_total: 0,
    proofs_collected: 0,
    proofs_required: 0,
    missing: [],
    notes: ["Placeholder — verification not yet implemented."],
  };
}

export function writeCompletionReport(outputPath: string, report: CompletionReport): void {
  writeJson(outputPath, report);
}
