PLAN-01 — Work Breakdown Rules (How Spec Becomes Work Units)
(Hardened Draft — Full)
1) Purpose
Define how Axion converts the Canonical Spec into a deterministic Work Breakdown:
work units with stable unit IDs
explicit scope per unit (spec ID references)
dependencies and sequencing constraints
deliverables per unit
This doc ensures decomposition is consistent, auditable, and resistant to drift.

2) Inputs
Canonical Spec (CAN-01 entities + indexes)
ID/reference rules (CAN-02)
Unknowns policy (CAN-03)
Resolved Standards Snapshot (STD-03) for constraints affecting sequencing
(Optional) system policies for unit sizing and risk flags

3) Outputs
A Work Breakdown artifact containing:
work_breakdown_id
spec_id
units[] (ordered list)
dependency_graph
unit_index (unit_id → unit)
created_at

4) Planning Invariants (must always be true)
Traceability: every work unit must reference at least one spec entity ID (scope_refs[]).
Deterministic: same canonical spec + same standards snapshot ⇒ same unit set and dependency graph (structure-level).
No cycles: dependency graph must be acyclic.
No “mega unit”: decomposition cannot be “build the whole app” in one unit.
No missing foundations: baseline units (setup/security/quality scaffolding) must exist when required by context.

5) Work Unit Contract (Locked Structure)
Each unit must include:
5.1 Identity
unit_id (stable; format unit_<slug>)
title
description
5.2 Scope
scope_refs[] (list of canonical IDs: feat_, wf_, scr_, op_, dat_, rol_, rule IDs)
in_scope (short summary)
out_of_scope (explicit exclusions)
5.3 Dependencies
depends_on[] (unit_id list)
unblocks[] (optional; derived)
5.4 Deliverables
deliverables[] (explicit artifacts/behaviors that must exist after unit completion)
5.5 Risk/Constraints (optional but recommended)
risk_flags[] (e.g., auth, data_migration, external_integration)
constraints_refs[] (standards rule_ids relevant to unit)

6) Decomposition Rules (How units are created)
6.1 Baseline Unit Set (context-driven, required)
The planner must always produce baseline units based on context:
PLAN1-BASE-01 Project Setup
always required for new builds
scope_refs: architecture/implementation scaffolding (no feature refs)
PLAN1-BASE-02 Security Foundation (conditional)
Required if:
auth.required == true OR security standards indicate baseline enforcement
Scope refs include: roles/permissions model + auth constraints
PLAN1-BASE-03 Data Foundation (conditional)
Required if:
data.enabled == true
Scope refs include: dat_* entities and relationship model
PLAN1-BASE-04 Quality Foundation (always)
Required:
verification scaffolding per quality standards (tests, lint, build checks)
PLAN1-BASE-05 Ops Foundation (conditional)
Required if:
ops required by preset/scope (deployable system)
Scope refs include: ops constraints + env expectations

6.2 Feature Slice Units (vertical slices)
For each must-have feature (feat_*), the planner must create at least one unit:
unit_feat_<feature_slug>_slice
Scope refs should include:
feat_* (feature)
wf_* (workflows supporting it)
scr_* (screens supporting it, if UI)
op_* (operations supporting it, if backend)
dat_* (data objects, if data enabled)
Rule: must-have features cannot be left unassigned to units.

6.3 Workflow-first decomposition (allowed)
When spec is workflow-heavy, planner may create units by workflow:
unit_wf_<workflow_slug>_slice
Scope refs include workflow + mapped features/screens/ops
Rule: workflow-based units must still cover all must-have features.

6.4 Integration units (conditional)
If integrations exist, planner creates:
unit_integration_<service_slug>
Scope refs: integration + affected ops/data/features

6.5 Unknown constraints on decomposition
If there are blocking unknowns in core areas:
planner must not create downstream dependent units that assume resolved unknowns
planner may create a “resolution unit”:
unit_resolve_unknowns_core
scope_refs: unk_* items
deliverable: decisions/inputs required to unblock

7) Dependency Rules (How depends_on is assigned)
7.1 Foundational ordering (hard constraints)
Setup precedes everything.
Security foundation precedes any unit requiring auth/permissions enforcement.
Data foundation precedes any unit that uses dat_* entities.
API contract units (if modeled) precede dependent implementation units (if you include API units as work units; optional).
7.2 Feature slice dependencies
A feature slice depends on:
setup
any needed foundations (security/data/ops)
any prerequisite shared components (if modeled)

8) Unit Sizing Rules (anti-drift)
Units must be sized so that:
a unit can be verified with acceptance checks
a unit’s deliverables are concrete and testable
a unit does not span unrelated features
Heuristic bounds (non-binding but enforced as warnings unless you choose hard stops):
max number of primary scope_refs per unit (e.g., 1–3 features/workflows)
avoid units with >N screens and >N operations unless justified

9) Failure Modes
units with no scope_refs (no traceability)
dependency cycles
features not mapped to units (missing work)
units too broad (agent drift)
units sequenced before prerequisites exist

10) Definition of Done (PLAN-01)
PLAN-01 is complete when:
unit contract is locked (identity/scope/deps/deliverables)
baseline unit rules exist and are context-driven
feature/workflow slicing rules ensure coverage of must-have features
dependency constraints are explicit and acyclic
unknowns blocking policy is respected in decomposition

