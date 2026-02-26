STATE-03 — Handoff Rules (Agent-to-Agent Continuity)
(Hardened Draft — Full)
1) Purpose
Define how work is safely handed off between agents (or sessions) without drift by ensuring the next agent can resume using only artifacts, not chat memory.
STATE-03 governs:
what must be recorded before handoff
what the receiving agent must do first
what constitutes a valid handoff package

2) Inputs
State Snapshot (STATE-01)
Resume rules (STATE-02)
Work Breakdown + Acceptance Map (PLAN)
Proof Log (VER-01)
Kit manifest/index/versions (KIT-02/KIT-04)
Unknowns (CAN-03)

3) Outputs
A deterministic handoff state consisting of:
updated state snapshot (complete, consistent)
proof log pointers (up to date)
explicit blockers/unknowns/decisions
last-known-good checkpoint

4) Handoff Invariants (must always be true)
No hidden context: all critical context must be in artifacts (state/proof/unknowns/decisions), not chat.
Unambiguous “what’s next”: current unit or next eligible unit must be determinable.
Proof-linked progress: any completed work claims must have proof refs.
Integrity: all referenced IDs resolve (unit_id, acceptance_id, proof_id, unknown_id).
Version awareness: handoff must include the kit’s pinned versions.

5) Pre-Handoff Requirements (Sender Must Do)
H-01 Update State Snapshot
Sender must ensure:
updated_at reflects latest work
current_unit_id is correct (or null if none)
unit statuses are accurate
acceptance_status updated for any checks run
blockers recorded for any inability to proceed
decisions/overrides recorded if made
history events appended for changes made
H-02 Update Proof Log
Sender must ensure:
proofs are recorded with proof_id, acceptance_id, unit_id
proof locations are valid and accessible
no “proof” exists only in chat
H-03 Last Known Good (LKG) Updated
Sender must record:
last successful verification checkpoint
supporting proof refs
H-04 Unknowns Updated
Sender must:
mark resolved unknowns as resolved with resolution_ref
record open blocking unknowns as blockers where they impact current work
H-05 Integrity Check Before Handoff (mandatory)
Before handoff, sender must validate:
state snapshot references resolve to work breakdown and acceptance map
proofs referenced exist and are linked correctly
no unit is marked done without required proofs (VER-03)
If integrity fails → handoff is invalid; record blocker HANDOFF_INTEGRITY_FAIL.

6) Receiving Agent Procedure (Must Do First)
Step 1 — Read Entrypoint + Manifest + Versions
Receiving agent must read:
00_START_HERE.md
00_KIT_MANIFEST.md
00_VERSIONS.md
Step 2 — Load Core Artifacts
Must load:
standards snapshot
canonical spec
work breakdown
acceptance map
state snapshot
Step 3 — Run Resume Algorithm
Must execute STATE-02 to determine:
resume target unit
blockers/unknown constraints
required verification commands
Step 4 — Confirm No Drift
Receiving agent must not proceed if:
state integrity check fails
versions changed unexpectedly without recorded compatibility event
blocking unknowns intersect current unit scope

7) Handoff Package Definition (What must exist)
A valid handoff requires these artifacts to be present and current:
01_core_artifacts/06_state_snapshot.json (updated)
00_PROOF_LOG.md (updated)
core artifacts and manifest/versions (present)
any referenced proof files exist at recorded locations

8) Failure Modes
sender forgets to record blockers/decisions, next agent improvises
sender claims completion without proof refs
receiver uses chat memory rather than state snapshot
missing proof files break auditability
versions mismatch causes stale assumptions

9) Definition of Done (STATE-03)
STATE-03 is complete when:
pre-handoff requirements are explicit and enforceable
receiving procedure is explicit and references STATE-02
handoff package contents are explicit
integrity checks and failure handling are specified
