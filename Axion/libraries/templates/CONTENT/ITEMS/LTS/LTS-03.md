# LTS-03 — Error Logging Standard (error shapes, stack rules)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-03                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error logging standard (error shapes, stack rules)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error Logging Standard (error shapes, stack rules) Document                         |

## 2. Purpose

Define the canonical standard for logging errors and exceptions: consistent error objects, stable
error codes, stack trace handling rules, and correlation requirements. This standard ensures
errors are diagnosable without leaking sensitive data.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Error/status policy: {{xref:API-03}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Telemetry schema: {{xref:OBS-02}} | OPTIONAL
- Client error boundary strategy: {{xref:CER-01}} | OPTIONAL
- Incident severity model: {{xref:IRP-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Error object schema (fields list)
Stable error code rules (namespace, format)
Error classification (user error vs system error)
Stack trace rules (when allowed, how truncated)
PII/secret redaction rule (no raw payloads)
Correlation requirement (request_id/trace_id always)
Mapping to HTTP status codes (API-03 refs)
Client vs server error logging differences
Alerting trigger guidance (what counts as paging)
Telemetry requirements (error rate metric, unhandled exceptions)

Optional Fields
Error fingerprinting rule | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Never log request/response bodies containing PII/secrets.
Error codes must be stable across releases (avoid changing semantics).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Error Object Schema
fields: {{err.fields}}
required_fields: {{err.required_fields}} | OPTIONAL
2. Error Codes
format_rule: {{codes.format_rule}}
namespacing_rule: {{codes.namespacing_rule}} | OPTIONAL
3. Classification
classification_rules: {{class.rules}}
4. Stack Traces
stack_allowed_rule: {{stack.allowed_rule}}
truncation_rule: {{stack.truncation_rule}} | OPTIONAL
5. Redaction
denylist_fields: {{redact.denylist_fields}}
payload_logging_rule: {{redact.payload_rule}} | OPTIONAL
6. Correlation
correlation_required_fields: {{corr.required_fields}}
7. Status Mapping
status_mapping_ref: {{xref:API-03}} | OPTIONAL
mapping_rule: {{status.mapping_rule}} | OPTIONAL
8. Client vs Server
client_rule: {{diff.client_rule}}
server_rule: {{diff.server_rule}} | OPTIONAL
9. Alerting Guidance
paging_rule: {{alert.paging_rule}}
severity_ref: {{xref:IRP-01}} | OPTIONAL
10.Telemetry
error_rate_metric: {{telemetry.error_rate_metric}}
unhandled_exception_metric: {{telemetry.unhandled_exception_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:LTS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-02}}, {{xref:IRP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define error object fields, correlation fields, and redaction rules.
intermediate: Required. Define code format + status mapping + paging rule + telemetry.
advanced: Required. Add fingerprinting and strict stack rules and client/server differentiation
rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, required fields list, namespacing rule,
truncation rule, payload rule, status mapping rule, server rule, severity ref, optional metrics,
fingerprinting, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If err.fields is UNKNOWN → block Completeness Gate.
If codes.format_rule is UNKNOWN → block Completeness Gate.
If corr.required_fields is UNKNOWN → block Completeness Gate.
If alert.paging_rule is UNKNOWN → block Completeness Gate.
If telemetry.error_rate_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
error_schema_defined == true
correlation_defined == true
redaction_defined == true
alerting_guidance_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-04

LTS-04 — PII/Secret Redaction Standard (denylist, masking)
Header Block

## 5. Optional Fields

Error fingerprinting rule | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Never log request/response bodies containing PII/secrets.**
- **Error codes must be stable across releases (avoid changing semantics).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Error Object Schema`
2. `## Error Codes`
3. `## Classification`
4. `## Stack Traces`
5. `## Redaction`
6. `## Correlation`
7. `## Status Mapping`
8. `## Client vs Server`
9. `## Alerting Guidance`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:LTS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:IRP-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define error object fields, correlation fields, and redaction rules.**
- **intermediate: Required. Define code format + status mapping + paging rule + telemetry.**
- **advanced: Required. Add fingerprinting and strict stack rules and client/server differentiation**
- rigor.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, required fields list, namespacing rule,**
- truncation rule, payload rule, status mapping rule, server rule, severity ref, optional metrics,
- fingerprinting, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If err.fields is UNKNOWN → block

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
