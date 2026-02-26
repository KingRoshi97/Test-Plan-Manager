PLAN-02 — Acceptance Map Rules (How Proof Is Attached to Units)
(Hardened Draft — Full)
1) Purpose
Define how Axion generates an Acceptance Map that attaches verifiable “done” criteria to every work unit, including:
acceptance criteria statements
required checks (build/test/lint/etc.)
proof requirements (what evidence is needed)
gating severity (hard stop vs soft)
This prevents “claims without evidence” and ensures units are objectively completable.

2) Inputs
Work Breakdown (PLAN-01 output)
Canonical Spec (for feature/workflow rules)
Resolved Standards Snapshot (quality/security/ops constraints)
Proof model (VER docs will define proof types; for now acceptance must reference allowed proof types)

3) Outputs
An Acceptance Map artifact containing:
acceptance_map_id
work_breakdown_id
spec_id
acceptance_items[]
unit_acceptance_index (unit_id → acceptance_ids)
created_at

4) Acceptance Invariants (must always be true)
Coverage: every work unit has acceptance items.
Proof required for hard gates: completion requires proof for all hard-gate acceptance items.
Deterministic mapping: same work breakdown + same standards ⇒ same acceptance structure (at least in count and categories).
Traceability: acceptance items link to unit_id and relevant spec IDs.
Runnable verification: acceptance items must specify how to verify (commands or manual steps).

5) Acceptance Item Contract (Locked Structure)
Each acceptance item must include:
5.1 Identity
acceptance_id (stable; format acc_<slug>)
unit_id (required)
5.2 Criterion
statement (clear “done when…”)
criterion_type (enum-like category)
build_check
test_check
lint_check
functional_check
security_check
data_integrity_check
ui_check
performance_check
regression_check
manual_check
5.3 Proof Requirement
proof_required (boolean; default true for hard gates)
proof_type (command_output | test_result | screenshot | log_excerpt | diff_ref | checklist)
proof_instructions (how to capture/store)
proof_location_hint (path/pointer key)
5.4 Verification Instructions
how_to_verify (commands and/or steps)
expected_result (what passing looks like)
5.5 Gating
gating (hard_gate | soft_gate)
5.6 Scope References (required)
scope_refs[] (spec IDs relevant to this criterion)

6) Acceptance Generation Rules
6.1 Minimum acceptance per unit (hard requirement)
Every unit must have at least:
1 deliverable/functional criterion (functional_check / ui_check / data_integrity_check)
1 verification criterion (build/test/lint or manual)
1 proof requirement attached to each hard_gate criterion
If a unit is purely planning/scaffolding, functional criterion may be replaced with:
“artifact exists and matches contract” criterion (manual_check or functional_check with file verification)

6.2 Standards-driven checks (context required)
From Standards Snapshot:
If quality standards require build/lint/tests:
include acceptance items for those checks on applicable units
If security standards require auth/permission enforcement checks:
include security_check items on affected units
If ops standards require deploy checks:
include relevant checks on ops-related units

6.3 Risk-based enrichment (required when flagged)
If a unit has risk_flags such as:
auth → include security_check items (login, session handling, role restrictions)
data_migration → include data_integrity_check + rollback considerations
external_integration → include contract check + failure-mode behavior

6.4 UI units (if screens involved)
If a unit includes scr_* scope refs:
include ui_check items for:
empty/loading/error states
role access gating
basic usability requirements
if accessibility is required by standards:
include accessibility-related acceptance (can be ui_check or manual_check until VER defines specifics)

6.5 Unknown handling
If a unit depends on blocking unknowns:
acceptance must include a blocking criterion:
“unknowns resolved and recorded” with proof (decision record / updated submission)

7) Completion Rules (unit done criteria)
A unit is complete only when:
all hard_gate acceptance items are PASS
all required proof artifacts are attached and linked
Soft gates may remain as warnings, but must be recorded.

8) Failure Modes
units without acceptance criteria (agent improvisation)
criteria vague (“works well”) (not verifiable)
proof not required (claims without evidence)
standards requirements omitted (quality drift)
acceptance not linked to scope refs (no traceability)

9) Definition of Done (PLAN-02)
PLAN-02 is complete when:
acceptance item contract is locked
minimum acceptance rules per unit are explicit
standards-driven check inclusion is explicit
risk-based enrichment rules are explicit
completion rules (hard_gate + proof) are explicit and enforceable



