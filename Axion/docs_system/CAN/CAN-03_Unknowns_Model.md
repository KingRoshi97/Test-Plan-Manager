CAN-03 — Unknowns Model (Representation + Handling)
(Hardened Draft — Full)
1) Purpose
Define how Axion represents missing/uncertain information as explicit Unknown objects so the system never:
guesses requirements
hides gaps as empty fields
relies on chat memory
silently proceeds with ambiguous decisions
Unknowns are first-class entities that can be:
non-blocking (allowed to proceed)
blocking (must be resolved before downstream steps)

2) Inputs
Normalized Input Record (fields missing, ambiguous, contradictory)
Validation warnings (if supported)
Canonical Spec (where unknowns may attach)
Standards Snapshot (what is fixed vs configurable; affects blocking status)

3) Outputs
A canonical unknowns collection inside the Canonical Spec:
unknowns[] (list of Unknown objects)
unknown_index (map: unknown_id → object)
references to unknowns from affected entities/sections (as needed)

4) Unknown Object Contract (Locked Structure)
Each Unknown must have:
4.1 Identity
unknown_id (string; follows CAN-02 ID conventions, prefix unk_)
created_at (timestamp)
status (enum): open | resolved
resolution_ref (optional; pointer to decision/override/input update)
4.2 Classification
unknown_type (enum):
missing_requirement
ambiguous_requirement
contradiction
unresolved_decision
missing_reference
missing_constraint
severity (enum): low | medium | high
blocking (boolean)
4.3 Scope Attachment (what it affects)
At least one of:
applies_to (typed ref): { ref_type, ref_id } (CAN-02 typed ref)
field_path (schema path) (for intake-derived unknowns)
template_ref (template_id + section_id) (for template fill unknowns)
4.4 Description (human-readable, non-ambiguous)
summary (one sentence)
detail (longer explanation)
impact (what breaks or becomes risky if unresolved)
4.5 Resolution Requirements
what_is_needed_to_resolve (explicit question(s) or data required)
allowed_resolution_methods[] (enum list):
user_input_update
standards_override
explicit_decision_record
de_scope_feature
mark_not_applicable
default_resolution_policy (enum):
must_resolve_before_spec_final
must_resolve_before_planning
must_resolve_before_template_fill
may_defer_to_execution
may_remain_unknown (rare; only for non-core areas)

5) Unknown Creation Rules (when to create unknowns)
CAN03-NEW-01 Missing required-but-unknown input
If a required concept exists but lacks details (e.g., “auth required” but no methods), create an unknown if it’s allowed to proceed; otherwise gate fail at INT-03.
CAN03-NEW-02 Ambiguity
If user input can be interpreted in multiple incompatible ways, create an unknown of type ambiguous_requirement.
CAN03-NEW-03 Contradiction
If two statements conflict (e.g., out-of-scope includes “no auth” but auth.required true), create an unknown of type contradiction and mark blocking by default.
CAN03-NEW-04 Missing reference
If a reference cannot be resolved during spec build (should usually be prevented by INT-03), create unknown missing_reference and block.

6) Blocking Policy (strict)
6.1 Default blocking rules
Unknowns are blocking if they affect any of these core decision areas:
roles/permissions model
auth requirements
core workflows
must-have features list
data model existence when data.enabled
API contract existence when service/API build
standards snapshot constraints that must be obeyed
Unknowns may be non-blocking when they affect:
cosmetic design preferences
optional NFR details (unless required by preset)
optional integrations (when integrations disabled)
optional copy tone examples
6.2 Skill-level influence (allowed, but bounded)
Skill level can affect tolerance:
Beginner: more unknowns allowed, but not in core areas
Intermediate: fewer unknowns allowed
Expert: unknowns should be rare; core unknowns should trigger gates
Rule: skill level may reduce required detail, but it does not allow unknowns in core decision areas.

7) Unknown Storage & Referencing Rules
7.1 Centralized list is required
All unknowns must exist in canonical_spec.unknowns[]. No unknowns stored only inside templates.
7.2 References to unknowns
Entities/sections may reference unknowns by unknown_id in a simple list:
entity.unknown_refs[]: ["unk_..."]
7.3 Resolution must be traceable
When resolved:
set status = resolved
set resolution_ref to:
updated submission_id, OR
decision/override record ID, OR
standards snapshot override record ID

8) Gates Related to Unknowns
Unknowns interact with gates as follows:
Spec Gate fails if any blocking unknown exists at “spec finalization.”
Planning Gate fails if blocking unknowns exist that affect unit decomposition.
Template Gate fails if a template’s required fields would be UNKNOWN in a core area without allowed policy.

9) Failure Modes prevented
silent guessing to “fill in blanks”
agent relying on chat memory for missing decisions
templates embedding unknowns without traceability
contradictions ignored until late in build

10) Definition of Done (CAN-03)
CAN-03 is complete when:
Unknown object contract is fully specified
creation rules cover missing/ambiguous/contradictory/reference cases
blocking policy is strict and tied to core decision areas
resolution method and traceability requirements are explicit
unknown interactions with gates are specified

