import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";

export interface ResumePlan {
  run_id: string;
  created_at: string;
  resume_from_stage: string;
  remaining_stages: string[];
  context: Record<string, unknown>;
}

export function createPlaceholderResumePlan(runId: string): ResumePlan {
  return {
    run_id: runId,
    created_at: isoNow(),
    resume_from_stage: "",
    remaining_stages: [],
    context: {},
  };
}

export function writeResumePlan(outputPath: string, plan: ResumePlan): void {
  writeJson(outputPath, plan);
}
