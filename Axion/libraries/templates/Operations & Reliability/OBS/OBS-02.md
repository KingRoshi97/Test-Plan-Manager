# OBS-02 — Telemetry Schema Standard (common fields, correlation IDs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-02                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring telemetry schema standard (common fields, correlation ids)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Telemetry Schema Standard (common fields, correlation IDs) Document                         |

## 2. Purpose

Define the canonical telemetry schema used across logs, metrics events, and traces: required
common fields, correlation identifiers, naming conventions, and redaction rules. This standard
enables consistent querying and incident correlation across services and clients.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit schema (correlation fields): {{xref:AUDIT-02}} | OPTIONAL
- Logging standard (structure/fields): {{xref:LTS-01}} | OPTIONAL
- Tracing standard (propagation): {{xref:LTS-02}} | OPTIONAL
- Security monitoring baseline: {{xref:SEC-06}} | OPTIONAL
- Observability overview: {{xref:OBS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Schema version (semver)
Required common fields list (service, env, timestamp)
Correlation fields (request_id, trace_id, span_id)
Actor/context fields (user_id hash, tenant_id)
Client context fields (platform, app_version)
Error fields standard (error_code, stack policy ref)
Naming conventions (metric names, event names)
Cardinality constraints (allowed high-card fields)
Redaction/denylist fields (tokens, secrets, raw PII)
Validation rule (schema enforced in code/CI)
Telemetry requirements (schema validation failures)

Optional Fields
Sampling fields (sample_rate) | OPTIONAL
Extra dimensions allowlist | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Never emit secrets/tokens; hash or drop sensitive identifiers per redaction rules.
Correlation fields must be present for request-based telemetry where possible.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Schema Version
schema_version: {{schema.version}}
2. Required Common Fields
fields: {{schema.required_fields}}
3. Correlation
request_id_field: {{corr.request_id_field}}
trace_id_field: {{corr.trace_id_field}}
span_id_field: {{corr.span_id_field}} | OPTIONAL
4. Actor / Tenant Context
user_id_hash_field: {{ctx.user_id_hash_field}}
tenant_id_field: {{ctx.tenant_id_field}} | OPTIONAL
5. Client Context
platform_field: {{client.platform_field}}
app_version_field: {{client.app_version_field}} | OPTIONAL
6. Error Fields
error_code_field: {{err.error_code_field}}
stack_policy_ref: {{xref:LTS-03}} | OPTIONAL
7. Naming Conventions
metric_naming_rule: {{names.metric_rule}}
event_naming_rule: {{names.event_rule}} | OPTIONAL
8. Cardinality Constraints
high_cardinality_fields: {{card.fields}}
limits_rule: {{card.limits_rule}} | OPTIONAL
9. Redaction
denylist_fields: {{redact.denylist_fields}}
hashing_rule: {{redact.hashing_rule}} | OPTIONAL
10.Validation
enforcement_rule: {{validate.enforcement_rule}}
ci_gate_ref: {{validate.ci_gate_ref}} | OPTIONAL
11.Telemetry
schema_validation_fail_metric: {{telemetry.schema_validation_fail_metric}}

12.References
Logging standard: {{xref:LTS-01}} | OPTIONAL
Tracing standard: {{xref:LTS-02}} | OPTIONAL
Audit correlation: {{xref:AUDIT-02}} | OPTIONAL
Cross-References
Upstream: {{xref:OBS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OBS-03}}, {{xref:LTS-01}}, {{xref:ALRT-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define required fields, correlation fields, denylist, and validation rule.
intermediate: Required. Define naming/cardinality rules and client context fields.
advanced: Required. Add CI gate details, extra dimension allowlists, and strict enforcement
language.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, span id field, tenant/app version fields,
event naming, stack policy ref, limits rule, hashing rule, ci gate ref, sampling fields, dimension
allowlist, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If schema.version is UNKNOWN → block Completeness Gate.
If schema.required_fields is UNKNOWN → block Completeness Gate.
If corr.request_id_field or corr.trace_id_field is UNKNOWN → block Completeness Gate.
If redact.denylist_fields is UNKNOWN → block Completeness Gate.
If telemetry.schema_validation_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OBS
Pass conditions:
required_fields_present == true
schema_and_correlation_defined == true
redaction_defined == true
validation_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OBS-03

OBS-03 — Metrics Catalog (by metric_id)
Header Block

## 5. Optional Fields

Sampling fields (sample_rate) | OPTIONAL
Extra dimensions allowlist | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Never emit secrets/tokens; hash or drop sensitive identifiers per redaction rules.**
- **Correlation fields must be present for request-based telemetry where possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Schema Version`
2. `## Required Common Fields`
3. `## Correlation`
4. `## Actor / Tenant Context`
5. `## Client Context`
6. `## Error Fields`
7. `## Naming Conventions`
8. `## Cardinality Constraints`
9. `## Redaction`
10. `## Validation`

## 8. Cross-References

- **Upstream: {{xref:OBS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OBS-03}}, {{xref:LTS-01}}, {{xref:ALRT-02}} | OPTIONAL**
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
