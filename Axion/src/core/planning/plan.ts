import { NotImplementedError } from "../../utils/errors.js";
import type { WorkBreakdown, AcceptanceMap, SequencingReport } from "./outputs.js";

export interface PlanningResult {
  workBreakdown: WorkBreakdown;
  acceptanceMap: AcceptanceMap;
  sequencingReport: SequencingReport;
}

export function generatePlan(_runId: string, _specPath: string): PlanningResult {
  throw new NotImplementedError("generatePlan");
}
