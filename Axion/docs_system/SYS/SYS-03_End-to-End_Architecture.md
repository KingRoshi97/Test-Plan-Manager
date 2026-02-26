SYS-03 — End-to-End Architecture (Hardened Draft)
1) Purpose
Define the end-to-end Axion pipeline as a deterministic system: what stages exist, what each stage consumes, what it produces, and what gates control progression.

2) Pipeline Stages (locked)
Stage 0 — Intake
Consumes: user form inputs + uploads
Produces: Intake Submission Record
Gate: submission is recorded immutably (record creation success)
Stage 1 — Validation
Consumes: Intake Submission Record + Intake Schema
Produces: Validation Result (pass/fail + violations)
Gate: must pass schema + dependency rules + profile thresholds to proceed
Stage 2 — Normalization
Consumes: Validated submission + schema version + normalization rules
Produces: Normalized Input Record (+ normalization report)
Gate: normalization completes deterministically; no invented data; unknowns explicit
Stage 3 — Standards Resolution
Consumes: Normalized input + Standards Library (+ permitted overrides)
Produces: Resolved Standards Snapshot
Gate: snapshot is complete, version-pinned, and conflict-free (or conflicts explicitly blocked)
Stage 4 — Spec Building
Consumes: Normalized input + Resolved standards + vocabulary rules (if used)
Produces: Canonical Spec (with stable IDs + cross-maps + unknowns)
Gate: referential integrity, no duplicate truth, required spec sections present
Stage 5 — Planning / Decomposition
Consumes: Canonical spec + standards constraints
Produces: Work Breakdown (units + deps)
Gate: every unit traces to spec IDs; no cycles; unit size discipline passes
Stage 6 — Acceptance Mapping
Consumes: Work Breakdown + proof rules + quality standards
Produces: Acceptance Map (criteria + proof requirements per unit)
Gate: every unit has minimum acceptance + proof; high-risk units have required checks
Stage 7 — Template Selection & Filling
Consumes: Template Library + selection rules + Canonical spec + Standards snapshot + plans
Produces: Filled document set (templates populated)
Gate: each filled template passes its completeness gate; unknowns handled correctly
Stage 8 — Packaging
Consumes: core artifacts + filled docs + kit layout contract
Produces: Agent Kit folder + zipped kit + manifest/index + entrypoint
Gate: kit structure contract satisfied; required files present; N/A files present where applicable
Stage 9 — Execution (External Agent)
Consumes: Agent Kit
Produces: Built software + proof artifacts + completion report
Gate: acceptance checks and proof requirements satisfied (verification system)
Stage 10 — Continuity (Resumption/Handoff)
Consumes: State Snapshot + work breakdown + acceptance map
Produces: Updated State Snapshot + audit trail
Gate: last-known-good recorded; no skipping gates without override

3) Stage Inputs/Outputs Summary (compressed)
Intake → Submission Record
Validation → Validation Result
Normalization → Normalized Input Record
Standards → Resolved Standards Snapshot
Spec → Canonical Spec
Planning → Work Breakdown
Acceptance → Acceptance Map
Templates → Filled Docs
Packaging → Agent Kit
Execution → Proof + Completion
Continuity → State Snapshot updates

4) System Gates (where drift is blocked)
Schema gate (INT): requiredness, types, dependencies, thresholds
Normalization gate (A2): no invention, deterministic transforms
Standards gate (STD): resolved constraints, version pinned
Spec gate (CAN): referential integrity, no duplicate truth, explicit unknowns
Planning gate (PLAN): traceability, dependency correctness
Acceptance gate (QA/VER): proof required per unit
Template gate (TMP): completeness and consistency of filled docs
Packaging gate (KIT): layout contract, manifest completeness

5) Failure Modes (system-level)
Valid input but non-deterministic output (breaks trust)
Templates filled with invented content (breaks guarantees)
Kit missing required artifacts (external agent drift)
Acceptance lacks proof requirements (claims without evidence)

6) Definition of Done
SYS-03 is complete when:
every stage has clear inputs, outputs, and gating conditions
stages map to the Artifact Taxonomy (SYS-04)
no stage depends on undefined artifacts or undefined rules

