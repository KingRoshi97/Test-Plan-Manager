# LTS-02 — Tracing Standard (trace/span IDs, propagation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LTS-02                                             |
| Template Type     | Operations / Logging & Tracing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring tracing standard (trace/span ids, propagation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Tracing Standard (trace/span IDs, propagation) Document                         |

## 2. Purpose

Define the canonical tracing standard used across all services/clients: which propagation format
is used, how trace/span IDs are handled, what must be propagated across boundaries, and
what is prohibited in spans. This standard is the shared rulebook that OBS-04 implements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Telemetry schema: {{xref:OBS-02}} | OPTIONAL
- Trace instrumentation standard: {{xref:OBS-04}} | OPTIONAL
- Endpoint specs (auth/errors): {{xref:API-02}} | OPTIONAL
- Job specs: {{xref:JBS-02}} | OPTIONAL
- WebSocket spec: {{xref:API-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Propagation format (w3c tracecontext/b3/UNKNOWN)
Inbound extraction rule (read incoming trace headers)
Outbound injection rule (set outgoing headers)
Trace ID / Span ID format rule
Cross-boundary rules (HTTP, WS, jobs, events)
Correlation with logs (fields align with LTS-01/OBS-02)
Error status mapping (span status + error tags)
Privacy/redaction rule for attributes
Sampling rule reference (OBS-09)
Verification rule (propagation tests)
Telemetry requirements (missing propagation rate)

Optional Fields
Baggage usage rules | OPTIONAL
Third-party SDK constraints | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Propagation must be consistent across services; do not mix formats without explicit gateways.
Never include raw PII or secrets in trace attributes or baggage.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Propagation Format
format: {{prop.format}}
headers: {{prop.headers}} | OPTIONAL
2. Extraction / Injection
inbound_rule: {{prop.inbound_rule}}
outbound_rule: {{prop.outbound_rule}}
3. ID Formats
trace_id_rule: {{ids.trace_id_rule}}
span_id_rule: {{ids.span_id_rule}} | OPTIONAL
4. Boundaries
http_rule: {{bound.http_rule}}
ws_rule: {{bound.ws_rule}} | OPTIONAL
jobs_rule: {{bound.jobs_rule}} | OPTIONAL
events_rule: {{bound.events_rule}} | OPTIONAL
5. Log Correlation
log_fields_alignment_rule: {{corr.log_alignment_rule}}
logging_ref: {{xref:LTS-01}} | OPTIONAL
6. Error Mapping
span_status_rule: {{err.span_status_rule}}
error_tag_rule: {{err.error_tag_rule}} | OPTIONAL
7. Privacy / Redaction
attribute_denylist: {{privacy.attribute_denylist}}
baggage_denylist: {{privacy.baggage_denylist}} | OPTIONAL
8. Sampling
sampling_ref: {{xref:OBS-09}} | OPTIONAL
sampling_rule: {{sampling.rule}} | OPTIONAL
9. Verification
tests_rule: {{verify.tests_rule}}
coverage_target: {{verify.coverage_target}} | OPTIONAL
10.Telemetry
missing_propagation_metric: {{telemetry.missing_propagation_metric}}

Cross-References
Upstream: {{xref:OBS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LTS-03}}, {{xref:OBS-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define format and inbound/outbound rules and boundary handling.
intermediate: Required. Define log correlation and error mapping and denylist rules and
telemetry.
advanced: Required. Add baggage/third-party constraints and strict verification coverage
targets.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, headers, span id rule, boundary optional
rules, logging ref, error tag rule, baggage denylist, sampling rule, coverage target, baggage/sdk
constraints, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If prop.format is UNKNOWN → block Completeness Gate.
If prop.inbound_rule is UNKNOWN → block Completeness Gate.
If prop.outbound_rule is UNKNOWN → block Completeness Gate.
If bound.http_rule is UNKNOWN → block Completeness Gate.
If telemetry.missing_propagation_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LTS
Pass conditions:
required_fields_present == true
propagation_defined == true
boundary_rules_defined == true
privacy_defined == true
verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LTS-03

LTS-03 — Error Logging Standard (error shapes, stack rules)
Header Block

## 5. Optional Fields

Baggage usage rules | OPTIONAL
Third-party SDK constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Propagation must be consistent across services; do not mix formats without explicit gateways.**
- **Never include raw PII or secrets in trace attributes or baggage.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Propagation Format`
2. `## Extraction / Injection`
3. `## ID Formats`
4. `## Boundaries`
5. `## Log Correlation`
6. `## Error Mapping`
7. `## Privacy / Redaction`
8. `## Sampling`
9. `## Verification`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:OBS-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LTS-03}}, {{xref:OBS-07}} | OPTIONAL**
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
