# CRMERP-05 — Conflict Resolution Rules (source of truth, LWW, prompts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-05                                             |
| Template Type     | Integration / CRM & ERP                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring conflict resolution rules (source of truth, lww, prompts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Conflict Resolution Rules (source of truth, LWW, prompts) Document                         |

## 2. Purpose

Define the canonical conflict detection and resolution rules for CRM/ERP sync, including
source-of-truth per object/field, LWW/merge/prompt policies, and what happens when conflicts
cannot be resolved automatically. This template must be consistent with sync direction rules and
offline reconciliation patterns.

## 3. Inputs Required

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

## 4. Required Fields

system_id binding
Conflict detection signals (version/etag/updated_at)
Conflict taxonomy (types)
Default resolution policy (LWW/merge/prompt)
Per-object resolution rules (object → policy)
Per-field overrides (field → authority)
User prompt rules (if prompting allowed)
Automatic merge rules (if merge used)
Unresolvable conflict handling (quarantine/manual)
Telemetry requirements (conflict rate, outcomes)

Optional Fields
Admin resolution workflow ref | OPTIONAL
Batch conflict handling | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Bidirectional objects MUST define resolution policy; no UNKNOWN allowed for those.
Resolution must be deterministic unless explicitly prompt-based.
Prompts must not grant write authority beyond source-of-truth rules.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
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
Cross-References
Upstream: {{xref:CRMERP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define detection signals + default policy; use UNKNOWN for per-field
overrides.
intermediate: Required. Define per-object policies and unresolvable behavior and telemetry.
advanced: Required. Add merge/prompt rigor and admin workflows and batch handling rules.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, version field rule, examples, rationale,
notes, field overrides, prompt ui/copy refs, merge precedence, admin workflow ref, telemetry
fields, batch handling, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If policy.default is UNKNOWN → block Completeness Gate.
If unresolvable.behavior is UNKNOWN → block Completeness Gate.
If telemetry.conflict_metric is UNKNOWN → block Completeness Gate.
If detect.signals is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
conflict_detection_defined == true
resolution_policies_defined == true

unresolvable_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

CRMERP-06

CRMERP-06 — Rate Limits & Quotas (per vendor, backoff)
Header Block

## 5. Optional Fields

Admin resolution workflow ref | OPTIONAL
Batch conflict handling | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Bidirectional objects MUST define resolution policy; no UNKNOWN allowed for those.**
- **Resolution must be deterministic unless explicitly prompt-based.**
- **Prompts must not grant write authority beyond source-of-truth rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Conflict Detection`
2. `## Conflict Taxonomy`
3. `## Default Policy`
4. `## Per-Object Rules`
5. `## Rule`
6. `## (Repeat per object.)`
7. `## Per-Field Overrides (Optional)`
8. `## Override`
9. `## Prompt Rules (if applicable)`
10. `## Merge Rules (if applicable)`

## 8. Cross-References

- **Upstream: {{xref:CRMERP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
