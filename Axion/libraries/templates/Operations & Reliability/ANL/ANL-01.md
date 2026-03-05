# ANL-01 — Analytics Overview (goals, constraints)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-01                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring analytics overview (goals, constraints)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Analytics Overview (goals, constraints) Document                         |

## 2. Purpose

Create the single, canonical overview of product analytics and telemetry: why analytics exist,
what questions they answer, what constraints apply (privacy, cost, performance), and how
analytics differs from logs/metrics/traces. This document anchors the ANL set.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Data minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Consent model: {{xref:PRIV-04}} | OPTIONAL
- Event taxonomy: {{xref:ANL-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Analytics goals (top questions/KPIs)
In-scope surfaces (web/mobile/backend events)
Out-of-scope statement (explicit)
Privacy constraints (consent, minimization)
Identity/attribution constraints (anon vs logged-in)
Event quality principles (naming/versioning)
Toolchain inventory (analytics provider/warehouse)
Access controls (who can query)
Retention/deletion linkage (PRIV-05)
Completeness definition (what “instrumented” means)
Telemetry requirements (data drop rate, schema violations)

Optional Fields
Migration/rollout notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not collect PII in analytics unless explicitly allowed by PRIV rules and consent model.
Every claim should be traceable to inputs or marked UNKNOWN.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Goals
{{goals[0]}}
{{goals[1]}}
{{goals[2]}} | OPTIONAL
2. Scope
in_scope:
{{scope.in[0]}}
{{scope.in[1]}}
out_of_scope:
{{scope.out[0]}} | OPTIONAL
{{scope.out[1]}} | OPTIONAL
3. Privacy & Consent
minimization_ref: {{xref:PRIV-03}} | OPTIONAL
consent_ref: {{xref:PRIV-04}} | OPTIONAL
privacy_rule: {{privacy.rule}}
4. Identity & Attribution
identity_model_ref: {{xref:ANL-04}} | OPTIONAL
constraints: {{identity.constraints}}
5. Event Quality
taxonomy_ref: {{xref:ANL-02}} | OPTIONAL
schema_ref: {{xref:ANL-03}} | OPTIONAL
quality_principles: {{quality.principles}}
6. Toolchain
provider: {{tools.provider}}
warehouse: {{tools.warehouse}} | OPTIONAL
7. Access Controls
query_access_rule: {{access.query_rule}}
export_access_rule: {{access.export_rule}} | OPTIONAL
8. Retention / Deletion
retention_ref: {{xref:PRIV-05}} | OPTIONAL
analytics_retention_rule: {{retention.rule}}

9. Completeness Definition
instrumented_definition: {{complete.instrumented_definition}}
minimum_required_events: {{complete.minimum_events}}
10.Telemetry
event_drop_metric: {{telemetry.event_drop_metric}}
schema_violation_metric: {{telemetry.schema_violation_metric}} | OPTIONAL
11.References
Event taxonomy: {{xref:ANL-02}} | OPTIONAL
Funnels/KPIs: {{xref:ANL-07}} | OPTIONAL
Cross-References
Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ANL-02}}, {{xref:ANL-03}}, {{xref:ANL-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define goals, scope, privacy rule, toolchain, and completeness definition.
intermediate: Required. Define identity constraints, access controls, and retention rule and
telemetry metrics.
advanced: Required. Add rollout notes and strict traceability and quality governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional goals, out-of-scope items,
identity model ref, export access, warehouse, optional telemetry metric, rollout notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If goals[0] is UNKNOWN → block Completeness Gate.
If scope.in is UNKNOWN → block Completeness Gate.
If privacy.rule is UNKNOWN → block Completeness Gate.
If tools.provider is UNKNOWN → block Completeness Gate.
If complete.instrumented_definition is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ANL
Pass conditions:
required_fields_present == true
goals_and_scope_defined == true
privacy_and_access_defined == true
retention_defined == true
completeness_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ANL-02

ANL-02 — Event Taxonomy (by event_name)
Header Block

## 5. Optional Fields

Migration/rollout notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not collect PII in analytics unless explicitly allowed by PRIV rules and consent model.
- **Every claim should be traceable to inputs or marked UNKNOWN.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Goals`
2. `## Scope`
3. `## in_scope:`
4. `## out_of_scope:`
5. `## Privacy & Consent`
6. `## Identity & Attribution`
7. `## Event Quality`
8. `## Toolchain`
9. `## Access Controls`
10. `## Retention / Deletion`

## 8. Cross-References

- **Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-02}}, {{xref:ANL-03}}, {{xref:ANL-10}} | OPTIONAL**
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
