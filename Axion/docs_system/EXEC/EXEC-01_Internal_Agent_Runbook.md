EXEC-01 — Internal Agent Runbook (How the Internal Agent Runs Axion)
(Hardened Draft — Full)
1) Purpose
Define the deterministic procedure the internal agent must follow to run Axion end-to-end, including:
what to read first
what artifacts to produce at each stage
what gates to run and when to stop
what outputs must be packaged into the kit
what is prohibited (no invention, no self-modifying runs)
This is the operational “how to run the system” contract.

2) Inputs
System contracts: SYS-01..SYS-10
Build order graph + gate DSL: ORD-01..ORD-03
Intake system: INT-01..INT-05
Canonical model: CAN-01..CAN-03
Standards system: STD-01..STD-03
Template system: TMP-01..TMP-05
Planning system: PLAN-01..PLAN-03
Proof system contracts: VER-01..VER-03
Kit system: KIT-01..KIT-04
State system: STATE-01..STATE-03
Governance rules: GOV-01..GOV-04

3) Outputs
Validated submission boundary
Core artifacts:
normalized input record
resolved standards snapshot
canonical spec
work breakdown
acceptance map
initial state snapshot
Filled templates per selection result
Packaged Agent Kit (folder + manifest/index + entrypoint + versions)
Gate reports (recommended) and error reports (required on failure)

4) Runbook Invariants (must always be true)
Read-only system assets: templates/standards/contracts are read-only during normal runs (SYS-10).
No invention: missing info becomes UNKNOWN or gate fail; never guessed (SYS-01/SYS-10).
No forward progress without compliance: stop on hard gate failures (SYS-07).
Traceability: all artifacts are linked by IDs and version-stamped (SYS-06, KIT-04).
Deterministic outputs: same inputs + versions yield same structure (SYS-02).

5) Execution Modes (Locked)
Mode A: Kit Generation Mode (default)
Produces a new agent kit from a submission. System assets are read-only.
Mode B: System Update Mode (maintainer-only)
Not allowed in this runbook. Governed by GOV change control.

6) Pipeline Procedure (Locked Steps)
Step 0 — Initialize Run Context
Create run_context:
submission_id (or pending)
pinned versions:
system_version
schema_version (from intake)
standards_library_version
template_library_version
environment label (optional)
Gate: fail if versions cannot be pinned.

Step 1 — Intake Submission Record
Create INT-04 Submission Record from raw user form payload + uploads
Stamp form_version, schema_version
Gate: record creation success; payload hash integrity if enabled.

Step 2 — Validate Submission (INT-05)
Validate INT-04 raw payload against:
INT-02 schema (types/base constraints)
INT-03 validation rules (dependencies/thresholds/references)
Produce INT-05 Validation Result
Gate: if is_valid == false → stop and return validation report (no downstream artifacts).

Step 3 — Normalize Input (A2 Normalized Input Record)
Normalize validated submission deterministically:
canonical naming
list normalization/deduping
enum standardization
extraction where rules allow
Produce 01_normalized_input_record.json
Gate: normalization integrity (no invention) and schema consistency.

Step 4 — Resolve Standards (STD-03)
Build resolver_context from normalized input
Select packs, merge rules, apply/deny overrides (STD-02)
Emit 02_resolved_standards_snapshot.json
Gate: conflict-free snapshot; version stamps present; blocked overrides recorded.

Step 5 — Build Canonical Spec (CAN)
Build 03_canonical_spec.json according to CAN-01
Assign stable IDs (CAN-02)
Create unknowns (CAN-03) as needed
Gate: referential integrity; no duplicate truth; blocking unknown policy respected.

Step 6 — Work Breakdown (PLAN-01)
Decompose canonical spec into units:
baseline units
feature/workflow slices
integration units (if needed)
Emit 04_work_breakdown.json
Gate: all must-have features mapped to units; no cycles; dependencies valid.

Step 7 — Acceptance Map (PLAN-02)
Create acceptance items for each unit:
minimum required items
standards-driven checks
risk-based enrichment
Emit 05_acceptance_map.json
Gate: every unit has hard-gate acceptance with proof requirements.

Step 8 — Initialize State Snapshot (STATE-01)
Create initial 06_state_snapshot.json:
status in_progress
current_unit_id set to first eligible unit (per sequencing)
acceptance_status initialized
unknowns_status initialized
LKG empty or initial baseline
Gate: state references resolve; no unit marked done.

Step 9 — Select Templates (TMP-03)
Compute selection context from routing + gates
Select templates deterministically from Template Index
Emit selection result (stored in packaging metadata or as internal artifact)
Gate: baseline coverage satisfied; no missing upstream dependencies.

Step 10 — Fill Templates (TMP-04)
Fill each selected template using authoritative artifacts only
Emit filled docs into correct kit locations (KIT-01)
Ensure unknowns inserted map to canonical unknown objects
Gate: TMP-05 template gate must pass for each filled doc.

Step 11 — Package Kit (KIT)
Create kit folder structure (KIT-01)
Place core artifacts under 01_core_artifacts/
Place filled docs under 10_app/ and packs (20_domains/ etc.) as applicable
Create 00_KIT_MANIFEST.md + 00_KIT_INDEX.md (KIT-02)
Create 00_START_HERE.md (KIT-03)
Create 00_VERSIONS.md (KIT-04)
Create 00_RUN_RULES.md and blank 00_PROOF_LOG.md
Gate: packaging gate: required files exist; manifest/index consistent; N/A stubs present.

Step 12 — Final Output
Produce zipped kit (optional)
Return kit path + manifest summary + any warnings

7) Failure Handling (Hard Rules)
If any hard gate fails:
stop immediately
emit a gate report with:
rule_id
pointers
remediation steps
do not generate downstream artifacts beyond the failure point

8) Definition of Done (EXEC-01)
EXEC-01 is complete when:
steps cover intake → validation → normalization → standards → spec → plan → acceptance → state → templates → packaging
stop conditions are explicit and match SYS-07/ORD-02
read-only system asset rule is explicit
outputs align with KIT-01..KIT-04 contracts

