import { join } from "node:path";
import { createPlaceholderStateSnapshot, writeStateSnapshot } from "../../core/state/stateSnapshot.js";
import { createPlaceholderResumePlan, writeResumePlan } from "../../core/state/resume.js";
import { createHandoffDir } from "../../core/state/handoff.js";

export function cmdWriteState(runId: string, runDir: string): void {
  const stateDir = join(runDir, "state");

  const snapshot = createPlaceholderStateSnapshot(runId);
  writeStateSnapshot(join(stateDir, "state_snapshot.json"), snapshot);
  console.log(`  Wrote state_snapshot.json`);

  const resume = createPlaceholderResumePlan(runId);
  writeResumePlan(join(stateDir, "resume_plan.json"), resume);
  console.log(`  Wrote resume_plan.json`);

  createHandoffDir(runDir);
  console.log(`  Created handoff_packet/`);
}
