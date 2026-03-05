# LTS-01 — Logging Standard (levels, structure, fields)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-01                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring logging standard (levels, structure, fields)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Logging Standard (levels, structure, fields) Document                         |

## 2. Purpose

Define the canonical logging standard across services and clients: log levels, structured format,
required fields, correlation IDs, and redaction constraints. This standard is the source of truth for
how logs are produced and consumed.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Secrets/log redaction: {{xref:SKM-09}} | OPTIONAL
- Client logging policy: {{xref:CER-05}} | OPTIONAL
- Audit schema (correlation fields): {{xref:AUDIT-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Log levels and when to use (debug/info/warn/error)
Structured logging format rule (JSON fields)
Required common fields (service, env, timestamp)
Correlation fields required (request_id, trace_id)
Message field rule (human-readable + stable code)
Error object shape standard (error_code, stack policy)
PII/secret denylist rule (no tokens)
Sampling/volume control linkage (OBS-09/LTS-08)
Retention class rule (short/standard)
Validation/enforcement rule (lint/tests)
Telemetry requirements (missing field rate, invalid logs)

Optional Fields
Local dev logging behavior | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Logs must be structured; avoid free-form-only logs in prod.
Never log secrets/tokens; redact before emission.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Levels
levels: {{levels.list}}
usage_rules: {{levels.usage_rules}} | OPTIONAL
2. Format
format: {{format.type}} (json/UNKNOWN)
field_rule: {{format.field_rule}} | OPTIONAL
3. Required Fields
required_fields: {{fields.required}}
4. Correlation
request_id_field: {{corr.request_id_field}}
trace_id_field: {{corr.trace_id_field}} | OPTIONAL
5. Message & Codes
message_rule: {{msg.rule}}
stable_code_rule: {{msg.stable_code_rule}} | OPTIONAL
6. Errors
error_shape: {{err.shape}}
stack_policy_ref: {{xref:LTS-03}} | OPTIONAL
7. Redaction
denylist_fields: {{redact.denylist_fields}}
redaction_ref: {{xref:SKM-09}} | OPTIONAL
8. Sampling / Volume
volume_control_ref: {{xref:LTS-08}} | OPTIONAL
sampling_ref: {{xref:OBS-09}} | OPTIONAL
9. Retention
retention_rule: {{retention.rule}}
10.Enforcement
enforcement_rule: {{enforce.rule}}
ci_gate_ref: {{enforce.ci_gate_ref}} | OPTIONAL
11.Telemetry
missing_field_metric: {{telemetry.missing_field_metric}}
invalid_log_metric: {{telemetry.invalid_log_metric}} | OPTIONAL

Cross-References
Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OBS-05}}, {{xref:LTS-03}}, {{xref:LTS-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define levels, required fields, denylist, retention, enforcement.
intermediate: Required. Define correlation fields, error shape, sampling linkage, telemetry
metrics.
advanced: Required. Add stable codes conventions and local dev behavior and strict CI gating.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, usage rules, field rule, trace id field,
stable code rule, refs, ci gate ref, optional metrics, local dev, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If levels.list is UNKNOWN → block Completeness Gate.
If fields.required is UNKNOWN → block Completeness Gate.
If redact.denylist_fields is UNKNOWN → block Completeness Gate.
If retention.rule is UNKNOWN → block Completeness Gate.
If enforce.rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
levels_and_format_defined == true
correlation_defined == true
redaction_defined == true
retention_defined == true
enforcement_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-02

LTS-02 — Tracing Standard (trace/span IDs, propagation)
Header Block

## 5. Optional Fields

Local dev logging behavior | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Logs must be structured; avoid free-form-only logs in prod.**
- **Never log secrets/tokens; redact before emission.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Levels`
2. `## Format`
3. `## Required Fields`
4. `## Correlation`
5. `## Message & Codes`
6. `## Errors`
7. `## Redaction`
8. `## Sampling / Volume`
9. `## Retention`
10. `## Enforcement`

## 8. Cross-References

- **Upstream: {{xref:OBS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OBS-05}}, {{xref:LTS-03}}, {{xref:LTS-05}} | OPTIONAL**
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
