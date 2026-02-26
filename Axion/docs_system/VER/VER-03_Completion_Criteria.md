VER-03 — Completion Criteria (Global “Done” Rules)
(Hardened Draft — Full)
1) Purpose
Define the system-wide rules for declaring:
a work unit complete
the overall project complete
using acceptance criteria and proof artifacts—not claims.
VER-03 is the final authority for “done.”

2) Inputs
Work Breakdown (units + dependencies)
Acceptance Map (acceptance items + gating)
Proof Log (proof artifacts linked to acceptance)
State Snapshot (unit/acceptance status tracking)
Standards Snapshot (global required checks)

3) Outputs
Deterministic completion status:
unit completion status
overall completion status
A completion report structure (high-level; detailed template may exist elsewhere)

4) Completion Invariants (must always be true)
No proof, no done: completion claims require proof IDs.
Hard gates are absolute: all hard-gate acceptance items must pass.
Dependency-respecting: a unit cannot be complete unless its dependencies are complete (unless a recorded override exists).
State is authoritative for progress: completion status must be reflected in State Snapshot.
Auditability: completion must be reconstructable from artifacts (SYS-06).

5) Unit Completion Rules (Locked)
VER3-UNIT-01 Hard-gate pass required
A unit is complete only if:
all acceptance items with gating == hard_gate for that unit are PASS
each such acceptance item has required proof artifacts attached
VER3-UNIT-02 Proof linkage required
For each hard-gate acceptance item:
at least one proof_id is recorded
proof_id resolves to a proof record
proof record references same unit_id and acceptance_id
VER3-UNIT-03 Failure blocks completion
If any hard-gate acceptance item is FAIL or NOT_RUN:
unit status must be blocked or in_progress (not done)
VER3-UNIT-04 Soft-gates policy
Soft-gate acceptance items:
may remain FAIL only if global policy allows “complete with warnings”
all soft failures must be listed in completion report and state snapshot warnings

6) Overall Project Completion Rules (Locked)
VER3-PROJ-01 All required units done
Project completion requires:
every unit marked as required for scope is DONE
no required unit remains not_started/in_progress/blocked
VER3-PROJ-02 Global required checks satisfied
If standards snapshot mandates global checks (build/lint/tests/perf), then:
there must exist proof artifacts for those checks
mapped to a global completion acceptance item (or final unit)
VER3-PROJ-03 No blocking unknowns
Project cannot be complete if:
any unknown with blocking == true remains open
unless an override policy explicitly permits it (rare and must be recorded)
VER3-PROJ-04 No failed hard gates anywhere
If any hard-gate acceptance item across any unit is FAIL:
project is not complete

7) Completion Report Contract (Minimum)
A completion report must include:
project_status (complete|incomplete)
completed_at (if complete)
spec_id, work_breakdown_id, acceptance_map_id
units_summary:
total units
completed units
blocked units
hard_gate_failures[] (if any)
soft_gate_warnings[] (if any)
proof_index:
list of proof_ids used for final completion
open_blocking_unknowns[] (should be empty if complete)
Rule: Any “complete” report without proof_ids is invalid.

8) Overrides and Exceptions (Strict)
Overrides that allow bypassing completion conditions are:
strongly discouraged
must be explicitly recorded with:
what was bypassed
why
risk acknowledged
who approved
downstream impacts
Default policy: no overrides for completion hard gates.

9) Failure Modes
unit marked done without proof IDs
unit done while dependencies incomplete
project marked complete while blocking unknowns exist
global checks never run but completion claimed

10) Definition of Done (VER-03)
VER-03 is complete when:
unit completion rules are explicit and proof-based
project completion rules are explicit and proof-based
completion report minimum contract is defined
unknowns and overrides policies are explicitly integrated
