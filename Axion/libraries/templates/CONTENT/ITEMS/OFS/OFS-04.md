# OFS-04 — Reconciliation Rules (merge, LWW, prompts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-04                                             |
| Template Type     | Build / Offline Support                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring reconciliation rules (merge, lww, prompts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Reconciliation Rules (merge, LWW, prompts) Document                         |

## 2. Purpose

Define the canonical reconciliation rules for resolving divergence between local/offline state and
server truth, including merge strategy, LWW rules, user prompts, and how reconciliation errors
surface to the user. This template must be consistent with sync/mutation patterns and API error
policy and must not invent conflict semantics not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- OFS-02 Sync Model: {{ofs.sync_model}}
- SMD-03 Mutation Patterns: {{smd.mutation_patterns}} | OPTIONAL
- API-03 Error Policy: {{api.error_policy}} | OPTIONAL
- FE-07 Error UX: {{fe.error_ux}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Conflict taxonomy (typ... | spec         | Yes             |
| Default resolution pol... | spec         | Yes             |
| Per-entity/per-field r... | spec         | Yes             |
| User prompt rules (whe... | spec         | Yes             |
| Merge rules (field-lev... | spec         | Yes             |
| Audit/telemetry requir... | spec         | Yes             |
| Error surfacing rules ... | spec         | Yes             |

## 5. Optional Fields

“Keep mine / keep theirs” UX copy policy | OPTIONAL
Batch reconciliation rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Resolution policy MUST be deterministic and explicit.
User prompts MUST not be spammy; consolidate when possible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Triggers
triggers: {{recon.triggers}}
notes: {{recon.notes}} | OPTIONAL
2. Conflict Taxonomy
types: {{conflicts.types}}
examples: {{conflicts.examples}} | OPTIONAL
3. Default Policy
default_policy: {{policy.default}} (LWW/merge/prompt/UNKNOWN)
policy_rationale: {{policy.rationale}} | OPTIONAL
4. Per-Entity / Field Rules
Rule
entity_id: {{rules[0].entity_id}}
field: {{rules[0].field}} | OPTIONAL
resolution: {{rules[0].resolution}}
precedence: {{rules[0].precedence}} | OPTIONAL
prompt_required: {{rules[0].prompt_required}} | OPTIONAL
(Repeat per entity/field rule.)
5. User Prompt Rules
when_to_prompt: {{prompt.when_to_prompt}}
prompt_ui_pattern: {{prompt.ui_pattern}} (modal/screen/UNKNOWN)
copy_policy: {{prompt.copy_policy}} | OPTIONAL
6. Merge Rules
merge_strategy: {{merge.strategy}} (field_level/object_level/UNKNOWN)
merge_precedence: {{merge.precedence}} | OPTIONAL
7. Telemetry / Audit
conflict_metric: {{telemetry.conflict_metric}}
resolution_metric: {{telemetry.resolution_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
8. Error Surfacing
error_ux_ref: {{errors.ux_ref}} (expected: {{xref:FE-07}}) | OPTIONAL
unresolved_conflict_behavior: {{errors.unresolved_conflict_behavior}}
9. References
Sync model: {{xref:OFS-02}}
Offline handling: {{xref:SMD-05}} | OPTIONAL

Mutation patterns: {{xref:SMD-03}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
Cross-References
Upstream: {{xref:OFS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OFS-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define default policy and basic prompt rules; use UNKNOWN for per-field
rules.
intermediate: Required. Define per-entity rules and merge precedence.
advanced: Required. Add batching and refined prompt UX policy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, examples, policy rationale,
field/precedence/prompt_required, prompt UI/copy, merge precedence, telemetry fields, error ux
ref, copy policy, batching, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If policy.default is UNKNOWN → block Completeness Gate.
If telemetry.conflict_metric is UNKNOWN → block Completeness Gate.
If errors.unresolved_conflict_behavior is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OFS
Pass conditions:
required_fields_present == true
default_policy_defined == true
reconciliation_rules_defined == true
telemetry_defined == true
error_surfacing_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OFS-05

OFS-05 — Sync Observability (stuck queues, retries, metrics)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Resolution policy MUST be deterministic and explicit.**
- **User prompts MUST not be spammy; consolidate when possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Triggers`
2. `## Conflict Taxonomy`
3. `## Default Policy`
4. `## Per-Entity / Field Rules`
5. `## Rule`
6. `## (Repeat per entity/field rule.)`
7. `## User Prompt Rules`
8. `## Merge Rules`
9. `## Telemetry / Audit`
10. `## Error Surfacing`

## 8. Cross-References

- **Upstream: {{xref:OFS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OFS-05}} | OPTIONAL**
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
