CAN-01 — Canonical Spec Model (Entities + Relationships + IDs)
(Hardened Draft — Full)
1) Purpose
Define the Canonical Spec as the single authoritative structured truth model for a project. This model is what every downstream artifact references to prevent drift, contradictions, and missing foundations.
CAN-01 defines:
what entities exist in the canonical spec
required fields for each entity type
allowed relationships between entities
the required indexes/maps that make the model navigable
ID semantics and enforcement rules are defined in CAN-02.
Unknowns object model is defined in CAN-03.

2) Inputs
Normalized Input Record (A2.1)
Resolved Standards Snapshot (A2.2)
Intake routing snapshot (skill/category/type/build_target/audience)
(Optional) vocabulary/definitions mappings

3) Outputs
A single Canonical Spec artifact:
spec_id
submission_id
standards_snapshot_id
spec_version
spec object (entities)
index object (lookup tables + cross-maps)
unknowns object (list of unknown objects; canonical)

4) Core Invariants (must always be true)
Single source of truth: Canonical Spec is the only place where project truth is defined.
Stable IDs: every entity has a stable ID (rules in CAN-02).
Referential integrity: all references resolve (rules in CAN-02).
Explicit unknowns: unknowns are explicit entities (CAN-03), not missing fields.
Standards binding: constraints from standards snapshot are represented as constraints in the spec, not re-decided later.

5) Canonical Spec Top-Level Shape
canonical_spec = {
  meta: {...},
  routing: {...},
  constraints: {...},
  entities: {...},
  rules: {...},
  unknowns: {...},
  index: {...}
}


5.1 meta (required)
spec_id (string)
submission_id (string)
schema_version_used (string)
standards_snapshot_id (string)
standards_version_used (string)
spec_version (string)
created_at (timestamp)
5.2 routing snapshot (required)
skill_level
category
type_preset
build_target
audience_context
5.3 constraints (required)
Constraints are facts the system must obey, derived from:
Resolved Standards Snapshot
Intake constraints (scope bias, consumer design direction, etc.)
Minimum fields:
stack_constraints (object or list)
security_constraints (object or list)
quality_constraints (object or list)
design_constraints (object or list; if consumer)
fixed_vs_configurable (map; reference standards snapshot)

6) Entity Groups (canonical “truth entities”)
6.1 Role (required if any permissions/workflows exist)
Role entity
role_id
name
description (optional)
primary_goal (optional)
6.2 Capability / Feature (required)
Feature entity
feature_id
name
description (optional)
priority_tier (must / nice / future)
priority_rank (optional numeric; derived from rank list)
scope_boundaries:
in_scope[] (optional)
out_of_scope[] (optional)
workflow_refs[] (optional; links to workflows)
6.3 Workflow (required)
Workflow entity
workflow_id
name
actor_role_ref (role_id)
steps[] (ordered)
success_outcome
failure_states (optional)
priority (optional)
6.4 Permission / Capability Grant (required)
Permissions are represented as a relationship entity so they’re referenceable:
perm_id
role_ref (role_id)
allowed_capabilities[] (strings or capability IDs; choose one and lock in CAN-02)
restricted_actions[] (optional)
approval_required_actions[] (optional)
(If you later formalize capabilities as IDs, this becomes references.)
6.5 Screen (conditional: if UI app)
Screen entity
screen_id
name
purpose
roles_allowed[] (role_id refs)
data_shown (optional)
actions[] (optional)
state_notes (optional: empty/loading/error states)
6.6 UI Component (optional)
Only for “promoted” reusable components:
component_id
name
purpose
variants[] (optional)
usage_rules_ref (template or standards pointer; optional)
6.7 Data Object / Entity (conditional: if data.enabled)
Data entity
data_object_id
name
description (optional)
fields_required[] (list of field objects)
fields_optional[] (list of field objects)
relationships[] (relationship objects)
lifecycle_states[] (optional)
sensitive_flags[] (optional)
Field object (minimal):
name
type
notes (optional)
Relationship object (minimal):
relation_type
target_data_object_ref (data_object_id)
notes (optional)
6.8 Operation (required for service/backend builds; optional for pure UI)
Operations represent system actions (often API endpoints or internal operations):
operation_id
name
purpose
inputs_summary (optional)
outputs_summary (optional)
auth_required (optional boolean)
error_behavior (optional)
feature_refs[] (feature_id refs)
workflow_refs[] (workflow_id refs)
data_refs[] (data_object_id refs)
6.9 Integration (conditional: if integrations.enabled)
integration_id
service_name
purpose
data_in (optional)
data_out (optional)
triggers[] (optional)
secrets_handling (optional)
6.10 Non-Functional Requirement (optional)
Represent NFRs as structured constraints:
nfr_id
category (performance/reliability/compliance/etc.)
statement
targets (optional structured)
applies_to_refs[] (optional: feature/screen/operation refs)

7) Rules Group (canonical rules and constraints)
7.1 Business rules (optional)
must_always[]
must_never[]
validation_rules[]
lifecycle_rules[]
7.2 Definition of Done (required)
definition_of_done (string)
must_pass_checks[] (optional)
acceptance_criteria[] (optional)
rejection_conditions (optional)

8) Unknowns Group (present even if empty)
unknowns[] (list of unknown objects; defined in CAN-03)
unknown_index (map by unknown_id)

9) Index Group (required)
The canonical spec must include stable indexes to prevent re-parsing.
Minimum indexes:
roles_by_id, roles_by_name
features_by_id, features_by_name
workflows_by_id, workflows_by_name
screens_by_id (if any)
data_objects_by_id (if any)
operations_by_id (if any)
integrations_by_id (if any)
cross_maps:
workflow_to_features
feature_to_workflows
feature_to_operations
screen_to_workflows (if UI)
role_to_workflows
role_to_permissions

10) Failure Modes
missing entity IDs (breaks referenceability)
duplicated truth (same feature described differently in multiple places)
missing indexes (forces re-parsing, increases drift)
references that don’t resolve (broken integrity)
unknowns handled as empty fields rather than explicit objects

11) Definition of Done (CAN-01)
CAN-01 is complete when:
canonical spec top-level shape is locked
entity groups are enumerated with required fields
required index tables and cross-maps are defined
constraints and rules groups are represented explicitly
CAN-01 cleanly defers ID enforcement to CAN-02 and unknown policy to CAN-03

