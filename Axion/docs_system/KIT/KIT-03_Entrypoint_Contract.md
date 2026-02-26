KIT-03 — Entrypoint Contract (Single Start File Rules)
(Hardened Draft — Full)
1) Purpose
Define the single external-agent entrypoint file (00_START_HERE.md) so every kit can be executed consistently without the external agent guessing:
what to read first
what artifacts are authoritative
what order to work in
how to record progress and proof
what is prohibited (claims without proof, skipping gates)

2) Inputs
Kit structure (KIT-01)
Manifest/index contract (KIT-02)
Core artifacts (canonical spec, work breakdown, acceptance map, state snapshot, standards snapshot)
Proof rules (VER-01/02/03)
Boundaries (SYS-10), especially no guessing / no proofless claims

3) Outputs
A single file: 00_START_HERE.md that:
is complete and self-contained as instructions
references all authoritative artifacts by path
defines a deterministic execution loop

4) Entrypoint Invariants (must always be true)
Single start: external agent must start here; no alternate entrypoints.
Artifact authority: must explicitly declare which artifacts are truth.
Execution loop: must define “read → select unit → implement → verify → record proof → update state.”
No skipping: must prohibit skipping required steps without recorded override/decision.
No proof, no done: must require proof IDs for completion claims.

5) Required Sections (Locked Order)
00_START_HERE.md must contain these sections in order:
Purpose & How to Use This Kit
Authoritative Artifacts (Truth Sources)
Reading Order (Minimal Required Reading)
Execution Loop (Do This Repeatedly)
How to Verify (Commands + Proof Rules)
How to Record Progress (State Snapshot + Proof Log)
What Not To Do (Hard Prohibitions)
When Blocked (What to Output)
Completion Definition (What “Done” Requires)
Pointers (Links to Key Files)
Missing any section → Packaging Gate fail.

6) Required Content (Per Section)
6.1 Purpose & How to Use This Kit
Must state:
this kit is execution-ready instructions
the agent must follow work breakdown + acceptance map
6.2 Authoritative Artifacts
Must list and link:
01_core_artifacts/02_resolved_standards_snapshot.json
01_core_artifacts/03_canonical_spec.json
01_core_artifacts/04_work_breakdown.json
01_core_artifacts/05_acceptance_map.json
01_core_artifacts/06_state_snapshot.json
Must explicitly say:
chat memory is not authoritative
only these artifacts define truth
6.3 Reading Order (minimal)
Must include:
00_KIT_MANIFEST.md
the core artifacts above
the app-level implementation guidance docs (or where to find them)
6.4 Execution Loop
Must define the loop steps:
Read 06_state_snapshot.json to find current unit
If no current unit, select next eligible unit from 04_work_breakdown.json
Read unit scope + acceptance criteria
Implement unit deliverables
Run required verification commands
Attach proof to proof log and acceptance status
Update state snapshot (unit status, acceptance status, blockers)
Repeat
6.5 How to Verify
Must instruct:
run verification commands specified by Acceptance Map
capture proof per VER-01/02
fail-fast on hard-gate failures
6.6 How to Record Progress
Must require updates to:
00_PROOF_LOG.md (proof entries)
01_core_artifacts/06_state_snapshot.json (progress)
And specify:
unit cannot be marked done without proof refs
6.7 What Not To Do (Hard Prohibitions)
Must list at minimum:
do not invent requirements
do not skip acceptance checks
do not mark done without proof
do not change standards/constraints unless explicitly allowed and recorded
6.8 When Blocked
Must instruct:
mark unit blocked in state snapshot
record blocker with acceptance_id pointers
state what input/decision is needed
6.9 Completion Definition
Must reference VER-03 completion rules:
all required units done
all hard-gate acceptance pass with proof
no blocking unknowns
6.10 Pointers
Must provide direct links to:
manifest
key artifacts
app docs folder
domain/feature/screen packs (if present)

7) Failure Modes
entrypoint too vague → agent improvises
truth sources not explicit → agent uses chat memory
no execution loop → agent drifts
no recording rules → progress lost and continuity breaks

8) Definition of Done (KIT-03)
KIT-03 is complete when:
required sections are locked and complete
authoritative artifacts are explicitly listed and linked
execution loop is explicit and references work breakdown + acceptance map + state snapshot
proof and progress recording rules align with VER-01/02/03
prohibitions align with SYS-10 boundaries

