STATE-02 — Resume Rules (How to Restart Without Drift)
(Hardened Draft — Full)
1) Purpose
Define the deterministic procedure an agent must follow to resume work using the Agent Kit and State Snapshot, without relying on chat memory, assumptions, or re-planning drift.

2) Inputs
01_core_artifacts/06_state_snapshot.json (STATE-01)
01_core_artifacts/04_work_breakdown.json (PLAN-01)
01_core_artifacts/05_acceptance_map.json (PLAN-02)
01_core_artifacts/03_canonical_spec.json (CAN)
01_core_artifacts/02_resolved_standards_snapshot.json (STD)
00_KIT_MANIFEST.md / 00_VERSIONS.md (KIT-02/KIT-04)

3) Outputs
A deterministic “resume decision”:
which unit to work on next
what prerequisites must be satisfied
whether the run is blocked (and why)
Updated State Snapshot (timestamps, events)

4) Resume Invariants (must always be true)
Artifacts over memory: resume decisions come only from kit artifacts, never chat history.
No skipping: units cannot be skipped past hard dependencies without an override record.
No proofless progress: a unit cannot be marked done unless VER-03 conditions are met.
Version awareness: if kit versions changed, resume must treat this as a compatibility event.
Blocking unknowns block: open blocking unknowns prevent progress in affected scope.

5) Resume Procedure (Locked Steps)
Step 1 — Verify Kit Integrity
Confirm required core artifacts exist (KIT-01).
Confirm manifest and versions are present (KIT-02/KIT-04).
If missing → stop and record blocker: KIT_INTEGRITY_MISSING.
Step 2 — Load State Snapshot
Read:
current_unit_id
unit_status list
blockers list
acceptance_status
open blocking unknowns
If snapshot missing or corrupted → stop and record blocker.
Step 3 — Validate State Consistency
Check:
every unit_id referenced exists in work breakdown
every acceptance_id referenced exists in acceptance map
every proof_ref resolves to proof log (if available)
If inconsistencies exist:
mark system blocked
record blocker STATE_INTEGRITY_FAIL with pointers
Step 4 — Determine Resume Target
Decision order:
If current_unit_id exists and unit not done:
resume that unit
Else if any unit is in_progress:
choose the oldest in_progress unit (deterministic tie-breaker: earliest started_at, else lexical unit_id)
Else choose next eligible unit:
eligible means: status not_started AND all depends_on units are done
apply sequencing heuristics (PLAN-03) only as tie-breaker
If no eligible units:
if any units are blocked → overall status blocked
else if all required units done → overall status complete
else → record blocker NO_ELIGIBLE_UNIT (graph inconsistency)
Step 5 — Check Blocking Unknowns
If the chosen unit’s scope_refs intersect any open blocking unknowns:
do not proceed
set unit status blocked
record blocker BLOCKING_UNKNOWN referencing unknown_id(s)
Step 6 — Load Unit Execution Context
For selected unit:
read unit scope, deliverables, acceptance items
read relevant standards constraints (snapshot)
identify required verification commands and proof types
Step 7 — Execute Unit Loop (by kit rules)
Proceed with implementation per entrypoint loop:
implement deliverables
run acceptance checks
record proofs
update acceptance_status
update unit_status
append history events

6) Resume Tie-Breakers (Deterministic)
When multiple candidates exist, order by:
dependency eligibility (hard)
foundational priority (setup/foundations first)
must-have priority rank (if linked)
risk flags (higher earlier)
lexical unit_id

7) Compatibility / Version Change Handling
If the kit’s versions changed since last known snapshot event:
record a COMPATIBILITY_EVENT in history
do not assume prior proofs remain valid
rerun required global checks if standards or template versions changed materially (policy-driven)
(This does not modify the kit; it modifies state/proof requirements.)

8) Failure Modes
agent resumes using chat memory and skips artifacts
unit chosen without dependency eligibility
continuing despite open blocking unknowns
state snapshot references IDs that don’t exist (corruption)
compatibility changes ignored (stale proofs)

9) Definition of Done (STATE-02)
STATE-02 is complete when:
resume procedure is explicit and deterministic
candidate selection and tie-breakers are defined
blocking unknown policy is integrated
integrity checks for state/work/acceptance/proof links are defined
compatibility/version-change handling is defined without relying on memory

