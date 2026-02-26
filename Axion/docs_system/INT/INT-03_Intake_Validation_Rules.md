INT-03 — Intake Validation Rules (Dependencies + Thresholds)
(Hardened Draft — Full)
1) Purpose
Define all validation logic that goes beyond basic types:
dependency rules (“if X then Y required”)
contextual validity (category→type preset legality)
referential integrity rules (references must resolve)
skill-level thresholds (Beginner/Intermediate/Expert depth rules)
format checks that are conditional (file requiredness, URL requirements, etc.)
INT-03 is the logic layer that turns INT-02’s schema into an enforceable gate.

2) Inputs
INT-02 Intake Schema Spec (field paths + types)
Routing snapshot (routing.*)
Policy choices for warnings vs errors (if warnings exist)

3) Outputs
A deterministic set of validation rules consumed by:
Intake Validator
Gate reports (rule_id + pointers)
Validation result must reference rule IDs from this document.

4) Rule Format (locked)
Every rule must be written in this structure:
rule_id
description
when (condition)
then (requirements)
error_code
pointer_paths[] (what fields to point at)
severity (error | warning) (default: error)
notes (optional)

5) Rule Sets
5.1 Routing Validity Rules (category ↔ type preset)
INT3-ROUTING-01
when: always
then: routing.type_preset must be valid for routing.category
error_code: INVALID_ENUM_FOR_CONTEXT
pointers: routing.category, routing.type_preset
(Same pattern repeats for each category mapping; enforced through the preset map table.)

5.2 Build Target Rules (existing project requirements)
INT3-EXIST-01
when: routing.build_target == "existing"
then require:
existing.existing_repo_link present and valid URL
existing.current_state_summary present
error_code: DEPENDENCY_MISSING / INVALID_URL
pointers: existing.existing_repo_link, existing.current_state_summary

5.3 Audience Context Rules (consumer-facing minimums)
INT3-CONS-01
when: routing.audience_context == "consumer"
then require:
brand.stands_for
brand.brand_promise
brand.voice_adjectives[] length ≥ 1
error_code: DEPENDENCY_MISSING / MIN_ITEMS
pointers: brand.stands_for, brand.brand_promise, brand.voice_adjectives
INT3-CONS-02
when: routing.audience_context == "consumer"
then require: design.style_adjectives[] length ≥ 1
error_code: MIN_ITEMS
pointers: design.style_adjectives

5.4 Gate-Enabled Section Rules (data/auth/integrations)
INT3-DATA-01
when: data.enabled == true
then require: data.objects[] length ≥ 1
error_code: MIN_ITEMS
pointers: data.objects
INT3-AUTH-01
when: auth.required == true
then require: auth.methods[] length ≥ 1
error_code: MIN_ITEMS
pointers: auth.methods
INT3-AUTH-02
when: auth.approval_flows_needed == true
then require: auth.approval_flows_description present
error_code: DEPENDENCY_MISSING
pointers: auth.approval_flows_description
INT3-INTEG-01
when: integrations.enabled == true
then require: integrations.items[] length ≥ 1
error_code: MIN_ITEMS
pointers: integrations.items

5.5 Feature/Workflow/Role Integrity Rules (cross-references)
INT3-REF-01 (Role names unique)
when: spec.roles[] present
then require: all spec.roles[].name values unique
error_code: DUPLICATE_VALUE
pointers: spec.roles
INT3-REF-02 (Permissions reference valid roles)
when: spec.role_permissions[] present
then require: each role_name exists in spec.roles[].name
error_code: INVALID_REFERENCE
pointers: spec.role_permissions, spec.roles
INT3-REF-03 (Workflows reference valid roles)
when: spec.workflows[] present
then require: each actor_role exists in spec.roles[].name
error_code: INVALID_REFERENCE
pointers: spec.workflows, spec.roles
INT3-REF-04 (Feature priority rank references must-haves)
when: spec.feature_priority_rank[] present
then require: every entry exists in spec.must_have_features[].name
error_code: INVALID_REFERENCE
pointers: spec.feature_priority_rank, spec.must_have_features

5.6 Business Rules Toggle Integrity
INT3-RULES-01
when: spec.business_rules_enabled == true
then require: spec.must_always_rules[] length ≥ 1
error_code: MIN_ITEMS
pointers: spec.must_always_rules

5.7 Format Validations (conditional)
INT3-FMT-01 (Zip file type)
when: inputs.zip_upload present
then require: file type is .zip
error_code: INVALID_FILETYPE
pointers: inputs.zip_upload
INT3-FMT-02 (URL validity for reference links)
when: inputs.reference_links[] present
then require: each url is valid URL
error_code: INVALID_URL
pointers: inputs.reference_links
INT3-FMT-03 (Hex validity for brand colors)
when: design.brand_colors[] present
then require: each hex is valid hex color format
error_code: INVALID_FORMAT
pointers: design.brand_colors

6) Skill Level Threshold Rules (Depth Profile)
6.1 Core minimums (always)
INT3-SKILL-01 (Must-have features count)
when: routing.skill_level == beginner
then: spec.must_have_features.length >= 1
error_code: MIN_ITEMS
pointers: spec.must_have_features
INT3-SKILL-02
when: routing.skill_level == intermediate
then: spec.must_have_features.length >= 3
error_code: MIN_ITEMS
pointers: spec.must_have_features
INT3-SKILL-03
when: routing.skill_level == expert
then: spec.must_have_features.length >= 5
error_code: MIN_ITEMS
pointers: spec.must_have_features
INT3-SKILL-04 (Workflows count)
when: beginner or intermediate
then: spec.workflows.length >= 3
error_code: MIN_ITEMS
pointers: spec.workflows
INT3-SKILL-05 (Expert workflows alternative)
when: expert
then: either
spec.workflows.length >= 5
OR (spec.workflows.length >= 3 AND spec.edge_workflows.length >= 2)
error_code: MIN_ITEMS
pointers: spec.workflows, spec.edge_workflows
INT3-SKILL-06 (Out of scope count)
when: beginner
then: intent.out_of_scope.length >= 1
error_code: MIN_ITEMS
pointers: intent.out_of_scope
INT3-SKILL-07
when: intermediate
then: intent.out_of_scope.length >= 2
error_code: MIN_ITEMS
pointers: intent.out_of_scope
INT3-SKILL-08
when: expert
then: intent.out_of_scope.length >= 3
error_code: MIN_ITEMS
pointers: intent.out_of_scope

7) Final Confirmation Rules (must be true)
INT3-FINAL-01
when: always
then require:
final.confirm_priorities == true
final.confirm_out_of_scope == true
final.confirm_constraints == true
error_code: REQUIRED
pointers: those three fields

8) Failure Modes
rules contradict schema (wrong field paths)
thresholds too strict for the selected skill profile
missing rule coverage for key gates (consumer, existing, auth, data)
non-deterministic or ambiguous conditions (must be avoided)

9) Definition of Done (INT-03)
INT-03 is complete when:
every conditional requiredness in INT-01 is represented as a rule here
every rule has rule_id, when/then, error_code, pointers
skill-level thresholds cover features/workflows/out-of-scope minimums
reference integrity rules cover roles, permissions, workflows, priority rank
rules are deterministic (no vague conditions)

