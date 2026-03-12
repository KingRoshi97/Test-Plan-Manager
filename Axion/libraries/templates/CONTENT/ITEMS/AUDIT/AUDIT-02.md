# AUDIT-02 — Audit Schema (required fields, correlation IDs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-02                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring audit schema (required fields, correlation ids)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Audit Schema (required fields, correlation IDs) Document                         |

## 2. Purpose

Define the canonical schema for audit events: required fields, correlation identifiers, actor/target
structure, and redaction rules. This schema is used by capture rules, storage, and investigation
tooling.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Canonical schemas: {{xref:DATA-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Schema version (semver)   | spec         | Yes             |
| Actor schema (type/id/... | spec         | Yes             |
| Target schema (resourc... | spec         | Yes             |
| Request context fields... | spec         | Yes             |
| Correlation IDs (reque... | spec         | Yes             |
| Reason code field (den... | spec         | Yes             |
| PII redaction rules (w... | spec         | Yes             |
| Extensibility rule (ev... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Example audit event | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never include tokens/secrets or full content bodies in audit payloads.
Correlation IDs must be present for all events generated from API requests where possible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Schema Version
schema_version: {{schema.version}}
2. Required Fields
required_fields: {{schema.required_fields}}
3. Actor
actor_fields: {{actor.fields}}
actor_types: {{actor.types}} | OPTIONAL
4. Target
target_fields: {{target.fields}}
5. Context
context_fields: {{context.fields}}
hashing_rules: {{context.hashing_rules}} | OPTIONAL
6. Correlation
correlation_fields: {{corr.fields}}
7. Reason Codes
reason_code_field: {{reasons.field}}
format_rule: {{reasons.format_rule}} | OPTIONAL
8. Redaction
pii_hash_rule: {{redact.pii_hash_rule}}
denylist_fields: {{redact.denylist_fields}}
9. Extensibility
event_specific_fields_rule: {{ext.rule}}
10.Telemetry
schema_validation_fail_metric: {{telemetry.validation_fail_metric}}
11.Example (Optional)
example_event: {{example.event}} | OPTIONAL
Cross-References
Upstream: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-03}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define required fields and correlation and denylist.
intermediate: Required. Define actor/target/context schemas and redaction rules.
advanced: Required. Add extensibility rules, schema versioning, and example event and
validation telemetry.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, actor types, hashing rules, reason
format, example, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If schema.version is UNKNOWN → block Completeness Gate.
If schema.required_fields is UNKNOWN → block Completeness Gate.
If corr.fields is UNKNOWN → block Completeness Gate.
If redact.denylist_fields is UNKNOWN → block Completeness Gate.
If telemetry.validation_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
schema_defined == true
correlation_defined == true
redaction_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-03

AUDIT-03 — Capture Rules (what must be logged, where)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never include tokens/secrets or full content bodies in audit payloads.**
- **Correlation IDs must be present for all events generated from API requests where possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Schema Version`
2. `## Required Fields`
3. `## Actor`
4. `## Target`
5. `## Context`
6. `## Correlation`
7. `## Reason Codes`
8. `## Redaction`
9. `## Extensibility`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-03}}, {{xref:AUDIT-09}} | OPTIONAL**
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
