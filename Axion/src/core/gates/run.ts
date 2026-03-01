import { NotImplementedError } from "../../utils/errors.js";
import type { GateReport } from "./report.js";

export interface GateRunResult {
  reports: GateReport[];
  all_passed: boolean;
}

export function runAllGates(_runId: string, _runDir: string): GateRunResult {
  throw new NotImplementedError("runAllGates");
}
