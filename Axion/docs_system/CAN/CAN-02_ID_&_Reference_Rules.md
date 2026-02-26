CAN-02 — ID & Reference Rules (No Duplicate Truth, Referential Integrity)
(Hardened Draft — Full)
1) Purpose
Define the enforceable rules that make the Canonical Spec trustworthy:
how IDs are formed and assigned
what must be unique
how references are represented and validated
how “no duplicate truth” is enforced across entities and templates
what integrity checks must pass before downstream steps
CAN-02 is the integrity law for the canonical model.

2) Inputs
Canonical Spec (CAN-01 structure)
(Optional) vocabulary/definitions library for name normalization rules
Governance rules for versioning/migrations (when model changes)

3) Outputs
A locked set of integrity rules used by:
Spec Gate (SYS-07)
Planner/Decomposer
Template Filler
Packager (manifest integrity)

4) ID Rules (locked)
4.1 ID Requiredness
Every entity instance must have an ID field:
role_id, feature_id, workflow_id, perm_id
screen_id (if present), component_id (if present)
data_object_id (if present), operation_id (if present)
integration_id (if present), nfr_id (if present)
unknown_id (defined in CAN-03)
Rule: no entity is valid without its ID.

4.2 ID Format
IDs must be:
globally unique within the spec
stable across regeneration unless the underlying entity is truly new
Canonical format (recommended lock):
rol_<slug>
feat_<slug>
wf_<slug>
perm_<slug>
scr_<slug>
cmp_<slug>
dat_<slug>
op_<slug>
int_<slug>
nfr_<slug>
unk_<slug>
Slug rules:
lowercase
alphanumeric + underscore
deterministic from normalized name (with collision handling)

4.3 Collision Handling (deterministic)
If two entities normalize to the same slug:
append deterministic suffix: _2, _3, etc. based on stable ordering rules.
Stable ordering rule: order by original appearance in normalized input record.

4.4 ID Stability Rules
If an entity name changes only by whitespace/case normalization, ID must remain unchanged.
If entity meaning changes (feature replaced), a new ID must be created and the old one deprecated via governance notes (if applicable).

5) Uniqueness Rules (locked)
5.1 Name uniqueness requirements
These names must be unique within their entity type:
role.name
feature.name (within must/nice/future tiers can still collide—disallow collisions globally to simplify)
workflow.name
screen.name (if present)
data_object.name (if present)
operation.name (if present)
Violation results in:
error_code: DUPLICATE_VALUE
rule_id: CAN02-UNIQ-*

6) Reference Model (how entities refer to each other)
6.1 Reference type
Rule: References must be by ID, not by free-text names, whenever the target entity has an ID.
Canonical usage:
workflow.actor_role_ref must be role_id
screen.roles_allowed[] must be role_id
permission.role_ref must be role_id
operation.feature_refs[] must be feature_id
operation.workflow_refs[] must be workflow_id
operation.data_refs[] must be data_object_id
data.relationships.target_data_object_ref must be data_object_id
nfr.applies_to_refs[] must be entity IDs (typed ref; see 6.3)

6.2 Allowed reference edges (locked)
Allowed relationships:
Role → Workflows (as actor)
Role → Permissions (grant)
Workflow → Features (coverage)
Feature → Workflows (coverage)
Feature → Operations
Workflow → Screens (optional mapping)
Screen → Workflows (optional mapping)
DataObject → DataObject (relationships)
Operation → DataObject(s)
Operation → Feature(s)
Operation → Workflow(s)
Integration → Operation(s) (optional if formalized)
NFR → {Feature|Workflow|Screen|Operation|DataObject} (typed ref)
No other edges are allowed unless the model is extended via versioned migration.

6.3 Typed reference object (for mixed-target refs)
For fields like nfr.applies_to_refs[], use a typed ref structure:
{ ref_type: "feature"|"workflow"|"screen"|"operation"|"data_object", ref_id: "<id>" }
This prevents ambiguity.

7) Referential Integrity Checks (must pass)
7.1 Resolve checks
Every reference must resolve to an existing entity ID in the spec.
Violations produce:
error_code: INVALID_REFERENCE
pointer: referencing field path

7.2 Cross-map consistency checks
If cross-maps exist, they must agree with entity refs. Example:
if operation.feature_refs includes feat_123 then feature_to_operations[feat_123] must include op_456 (and vice versa)
Violations produce:
error_code: INVALID_REFERENCE (or INVALID_FORMAT if you want distinct)
rule_id: CAN02-XMAP-*

8) No Duplicate Truth (strict rules)
8.1 Canonical Spec is the only truth store
Product truth can only be defined in entities.
Templates, plans, and docs may summarize but must reference IDs and not redefine.
8.2 Duplicate truth detection rules
Treat as violation if:
same feature appears as two different feature entities with overlapping meaning
same workflow is described under different IDs with same steps and actor
permissions are repeated inconsistently (two perm objects for same role with conflicting capability grants)
Enforcement:
Spec Gate fails with CAN02-DUPTRUTH-*

9) Downstream Requirements (why these rules exist)
Downstream artifacts depend on CAN-02 guarantees:
Work Breakdown must map to IDs
Acceptance Map must map to IDs
Template filler must reference IDs
Pack manifest must index IDs
If CAN-02 fails, the pipeline must stop.

10) Failure Modes
name-based references cause drift when names change
missing typed refs causes ambiguity
collisions handled inconsistently breaks determinism
duplicate truth leads to contradictory templates

11) Definition of Done (CAN-02)
CAN-02 is complete when:
ID format and collision rules are explicit and deterministic
uniqueness rules are defined per entity type
reference model is ID-based and typed where needed
allowed edges are explicitly listed
referential integrity checks and cross-map consistency checks are defined
no-duplicate-truth enforcement is explicit and gateable

