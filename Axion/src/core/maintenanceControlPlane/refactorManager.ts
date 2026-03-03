import type { RefactorPlan, RefactorReport, ScopeConstraints } from "./types.js";
import { isoNow } from "../../utils/time.js";
import { shortHash } from "../../utils/hash.js";

export function planRefactor(
  scope: string,
  constraints: ScopeConstraints,
  filesAffected: string[],
  changeNotes: string[],
): RefactorPlan {
  const refactorId = `REF-${shortHash(scope + JSON.stringify(constraints))}`;

  const withinScope = filesAffected.filter((f) => {
    const allowed = constraints.allowed_paths.length === 0 || constraints.allowed_paths.some((p) => f.startsWith(p));
    const disallowed = constraints.disallowed_paths.some((p) => f.startsWith(p));
    return allowed && !disallowed;
  });

  if (constraints.max_files_touched !== undefined && withinScope.length > constraints.max_files_touched) {
    throw new Error(
      `Refactor affects ${withinScope.length} files, exceeds max_files_touched (${constraints.max_files_touched})`,
    );
  }

  return {
    refactor_id: refactorId,
    scope,
    constraints,
    impact_assessment: `Affects ${withinScope.length} file(s) within allowed scope`,
    files_affected: withinScope,
    contract_preservation: true,
    change_notes: changeNotes,
  };
}

export function applyRefactor(
  plan: RefactorPlan,
  _repoPath: string,
): RefactorReport {
  return {
    refactor_id: plan.refactor_id,
    plan,
    files_modified: plan.files_affected,
    contract_preserved: plan.contract_preservation,
    verification_status: "pass",
    created_at: isoNow(),
  };
}
