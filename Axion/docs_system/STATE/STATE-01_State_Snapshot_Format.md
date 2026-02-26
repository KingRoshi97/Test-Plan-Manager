STATE-01 — State Snapshot Format
(Hardened Draft — Full)
1) Purpose
Define the State Snapshot as the authoritative, resumable progress record so an agent can stop and restart without relying on chat memory. The State Snapshot is the continuity anchor that prevents drift by recording:
which unit is current
what’s complete vs blocked
acceptance pass/fail status
proof references
blockers and required decisions
last-known-good checkpoint

2) Inputs
Work Breakdown (units + dependencies)
Acceptance Map (acceptance items per unit + gating)
Proof Log (proof artifacts linked to acceptance items)
Unknowns (CAN-03) and their resolution status
Gate reports (optional but recommended) for audit

3) Outputs
A single machine-readable file in the kit:
01_core_artifacts/06_state_snapshot.json
This file is updated over time.

4) State Invariants (must always be true)
Single source for progress: State Snapshot is authoritative for progress, not chat.
Completion requires proof: unit completion status must align with acceptance/proof linkage (VER-03).
Deterministic pointers: state must reference units/acceptance/proof by IDs.
Append-safe: updates must not erase history; use event log or history pointers.
Resume-ready: snapshot must include enough context to select next unit without re-planning.

5) State Snapshot Contract (Top-Level Structure)
state_snapshot = {
  meta: {...},
  pointers: {...},
  unit_status: [...],
  acceptance_status: [...],
  proofs_index: [...],
  blockers: [...],
  decisions: [...],
  overrides: [...],
  unknowns_status: [...],
  last_known_good: {...},
  history: {...}
}


5.1 meta (required)
state_id (string)
submission_id
spec_id
work_breakdown_id
acceptance_map_id
created_at
updated_at
state_format_version
5.2 pointers (required)
status (enum): in_progress | blocked | complete
current_unit_id (string|null)
next_unit_candidates[] (optional; list of unit_ids)
blocked_on (optional; list of blocker_ids)

6) Unit Progress Tracking
6.1 unit_status[] (required)
Each entry:
unit_id
status (enum): not_started | in_progress | blocked | done
started_at (optional)
completed_at (optional)
notes (optional)
blocker_refs[] (optional)
acceptance_refs[] (optional; cached from acceptance map for convenience)
Invariant: done requires VER-03 conditions.

7) Acceptance Tracking
7.1 acceptance_status[] (required)
Each entry:
acceptance_id
unit_id
status (enum): not_run | pass | fail
last_run_at (optional)
proof_refs[] (list of proof_ids)
attempt_count (optional)
last_failure_summary (optional)

8) Proof Index
8.1 proofs_index[] (optional but recommended)
Each entry:
proof_id
acceptance_id
unit_id
proof_type
location
created_at
(This mirrors proof log entries for quick lookup.)

9) Blockers / Unknowns / Decisions
9.1 blockers[] (required if any)
Each blocker:
blocker_id
unit_id (optional)
acceptance_id (optional)
description
severity (low|med|high)
created_at
resolved_at (optional)
resolution_notes (optional)
needs (what input/decision fixes it)
9.2 decisions[] (optional)
Each decision:
decision_id
description
rationale (optional)
made_by (agent/user)
made_at
refs[] (spec IDs, template IDs, acceptance IDs)
9.3 overrides[] (optional)
Each override:
override_id
scope (standards/template/gate)
field_path or rule_id
before
after
approved_by
approved_at
reason
9.4 unknowns_status[] (optional but recommended)
Each entry:
unknown_id
status (open|resolved)
blocking (boolean)
resolution_ref (optional)

10) Last Known Good (LKG)
10.1 last_known_good (required)
timestamp
unit_id (optional)
verification_summary (string)
proof_refs[] (proof_ids supporting LKG)
Purpose: allow safe resume point and rollback reasoning.

11) History / Event Log (recommended)
To avoid overwriting important context, include either:
Option A (preferred): history.events[]
append-only list of state events:
unit started/completed
acceptance pass/fail
proof attached
blocker created/resolved
Each event:
event_id
event_type
timestamp
refs (unit_id, acceptance_id, proof_id)
Option B: history.log_ref
pointer to an external event log file

12) Failure Modes
unit marked done without proofs
acceptance results missing proof refs
current_unit_id missing and no way to choose next
blockers exist but not linked to unit/acceptance
history overwritten (loss of audit trail)

13) Definition of Done (STATE-01)
STATE-01 is complete when:
state snapshot structure is locked and machine-readable
unit/acceptance/proof linkage rules are explicit
blockers/decisions/overrides/unknown status fields are defined
last-known-good is required
history/event log approach is defined to prevent overwrites

