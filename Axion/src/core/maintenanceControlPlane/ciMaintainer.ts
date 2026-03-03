import type { CIUpdateReport } from "./types.js";
import { isoNow } from "../../utils/time.js";

export interface WorkflowDefinition {
  name: string;
  path: string;
  checks: string[];
}

export interface CIUpdatePolicy {
  preserve_checks: string[];
  allowed_modifications: string[];
}

export function updateWorkflows(
  workflows: WorkflowDefinition[],
  policy: CIUpdatePolicy,
): { updated: WorkflowDefinition[]; changes: Array<{ workflow: string; change_type: string; description: string }> } {
  const changes: Array<{ workflow: string; change_type: string; description: string }> = [];
  const updated: WorkflowDefinition[] = [];

  for (const wf of workflows) {
    const modifiedChecks = wf.checks.filter((c) => !policy.preserve_checks.includes(c));
    if (modifiedChecks.length !== wf.checks.length) {
      changes.push({
        workflow: wf.name,
        change_type: "checks_preserved",
        description: `Preserved ${policy.preserve_checks.length} required checks`,
      });
    }
    updated.push(wf);
  }

  return { updated, changes };
}

export function validateDoctorVerify(
  workflows: WorkflowDefinition[],
  requiredChecks: string[],
): { valid: boolean; missing: string[] } {
  const allChecks = new Set(workflows.flatMap((w) => w.checks));
  const missing = requiredChecks.filter((c) => !allChecks.has(c));

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function buildCIUpdateReport(
  runId: string,
  workflowPaths: string[],
  checksPreserved: boolean,
  changes: Array<{ workflow: string; change_type: string; description: string }>,
): CIUpdateReport {
  return {
    run_id: runId,
    workflows_updated: workflowPaths,
    checks_preserved: checksPreserved,
    changes,
    created_at: isoNow(),
  };
}
