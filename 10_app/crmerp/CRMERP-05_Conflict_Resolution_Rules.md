# CRMERP-05 — Conflict Resolution Rules (source of truth, LWW, prompts)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-05 |
| title | Conflict Resolution Rules (source of truth, LWW, prompts) |
| type | crmerp_conflict_resolution_rules |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-05_Conflict_Resolution_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-03", "OFS-04", "IXS-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "CRMERP-03", "CRMERP-02", "OFS-04", "IXS-05", "FE-07"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical conflict detection and resolution rules for CRM/ERP sync, including
source-of-truth per object/field, LWW/merge/prompt policies, and what happens when conflicts
cannot be resolved automatically. This template must be consistent with sync direction rules and
offline reconciliation patterns.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-03 Sync Direction Rules: {{crmerp.sync_direction}}
- CRMERP-02 Object/Entity Mapping: {{crmerp.mapping}} | OPTIONAL
- OFS-04 Reconciliation Rules: {{ofs.recon_rules}} | OPTIONAL
- IXS-05 Data Mapping Rules: {{ixs.data_mapping}} | OPTIONAL
- FE-07 Error/Recovery UX: {{fe.error_ux}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- system_id binding
- Conflict detection signals (version/etag/updated_at)
- Conflict taxonomy (types)
- Default resolution policy (LWW/merge/prompt)
- Per-object resolution rules (object → policy)
- Per-field overrides (field → authority)
- User prompt rules (if prompting allowed)
- Automatic merge rules (if merge used)
- Unresolvable conflict handling (quarantine/manual)
- Telemetry requirements (conflict rate, outcomes)

## Optional Fields

- Admin resolution workflow ref | OPTIONAL
- Batch conflict handling | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Bidirectional objects MUST define resolution policy; no UNKNOWN allowed for those.
- Resolution must be deterministic unless explicitly prompt-based.
- Prompts must not grant write authority beyond source-of-truth rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Conflict Detection
system_id: {{meta.system_id}}
signals: {{detect.signals}}
version_field_rule: {{detect.version_field_rule}} | OPTIONAL
2. Conflict Taxonomy
types: {{conflicts.types}}
examples: {{conflicts.examples}} | OPTIONAL
3. Default Policy
default_policy: {{policy.default}} (LWW/merge/prompt/UNKNOWN)
rationale: {{policy.rationale}} | OPTIONAL
4. Per-Object Rules
Rule
external_object: {{rules[0].external_object}}
policy: {{rules[0].policy}}
source_of_truth: {{rules[0].source_of_truth}} (external/internal/UNKNOWN)
notes: {{rules[0].notes}} | OPTIONAL
(Repeat per object.)
5. Per-Field Overrides (Optional)
Override
external_object: {{fields[0].external_object}}
field: {{fields[0].field}}
write_authority: {{fields[0].write_authority}} (external/internal/UNKNOWN)
notes: {{fields[0].notes}} | OPTIONAL
6. Prompt Rules (if applicable)
prompt_supported: {{prompt.supported}}
prompt_ui_pattern: {{prompt.ui_pattern}} | OPTIONAL
prompt_copy_ref: {{prompt.copy_ref}} | OPTIONAL

7. Merge Rules (if applicable)
merge_strategy: {{merge.strategy}} (field_level/object_level/UNKNOWN)
merge_precedence: {{merge.precedence}} | OPTIONAL
8. Unresolvable Conflicts
unresolvable_behavior: {{unresolvable.behavior}} (quarantine/manual/UNKNOWN)
admin_workflow_ref: {{unresolvable.admin_workflow_ref}} | OPTIONAL
9. Telemetry
conflict_metric: {{telemetry.conflict_metric}}
resolution_outcome_metric: {{telemetry.outcome_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
10.References
Sync direction: {{xref:CRMERP-03}}
Object mapping: {{xref:CRMERP-02}} | OPTIONAL
Offline reconciliation: {{xref:OFS-04}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
Reconciliation/backfills: {{xref:CRMERP-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:CRMERP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define detection signals + default policy; use UNKNOWN for per-field
overrides.
intermediate: Required. Define per-object policies and unresolvable behavior and telemetry.
advanced: Required. Add merge/prompt rigor and admin workflows and batch handling rules.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, version field rule, examples, rationale,
notes, field overrides, prompt ui/copy refs, merge precedence, admin workflow ref, telemetry
fields, batch handling, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If policy.default is UNKNOWN → block Completeness Gate.
If unresolvable.behavior is UNKNOWN → block Completeness Gate.
If telemetry.conflict_metric is UNKNOWN → block Completeness Gate.
If detect.signals is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
conflict_detection_defined == true
resolution_policies_defined == true

unresolvable_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
