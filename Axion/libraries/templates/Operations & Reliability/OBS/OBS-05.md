# OBS-05 — Log Event Catalog (by log_event_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-05                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring log event catalog (by log_event_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Log Event Catalog (by log_event_id) Document                         |

## 2. Purpose

Create the canonical catalog of application log events, indexed by log_event_id, including what
each event means, required fields, severity level, and redaction constraints. This catalog drives
consistent logging, alerting, and debugging across services.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Logging standard: {{xref:LTS-01}} | OPTIONAL
- Error logging standard: {{xref:LTS-03}} | OPTIONAL
- Secrets/log redaction rules: {{xref:SKM-09}} | OPTIONAL
- Telemetry schema: {{xref:OBS-02}} | OPTIONAL
- Error/status code policy: {{xref:API-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Log event registry (log_event_id list)
log_event_id (stable identifier)
Event name (human-readable)
Log level (debug/info/warn/error)
Trigger condition (what causes it)
Required fields (schema fields)
Optional fields (safe fields only)
Correlation fields required (request_id/trace_id)
Redaction rule (denylist refs)
Owner (team/service)
Primary use (debugging/alerting/audit-adjacent)
Telemetry requirements (log emit rate, missing fields)

Optional Fields
Example log line (redacted) | OPTIONAL
Alert bindings (alert_id list) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Never log tokens, secrets, raw PII; apply denylist/redaction standards.
Every error-level log event must include correlation fields for traceability.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_log_events: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Log Events (repeat per log_event_id)
Log Event
log_event_id: {{events[0].log_event_id}}
name: {{events[0].name}}
level: {{events[0].level}}
trigger: {{events[0].trigger}}
required_fields: {{events[0].required_fields}}
optional_fields: {{events[0].optional_fields}} | OPTIONAL
correlation_required: {{events[0].correlation_required}}
redaction_ref: {{events[0].redaction_ref}} (expected: {{xref:SKM-09}}/{{xref:LTS-04}}) |
OPTIONAL
owner: {{events[0].owner}}
primary_use: {{events[0].primary_use}}
alert_bindings: {{events[0].alert_bindings}} | OPTIONAL
example_log: {{events[0].example_log}} | OPTIONAL
telemetry_metric: {{events[0].telemetry_metric}}
open_questions:
{{events[0].open_questions[0]}} | OPTIONAL
(Repeat per log event.)
3. References
Logging standard: {{xref:LTS-01}} | OPTIONAL
Redaction standard: {{xref:LTS-04}} | OPTIONAL
Alert catalog: {{xref:ALRT-02}} | OPTIONAL
Cross-References
Upstream: {{xref:LTS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:ALRT-02}}, {{xref:OBS-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define log_event_id, level, trigger, required fields, correlation, owner.
intermediate: Required. Define redaction refs, primary use, and telemetry metric per event.
advanced: Required. Add example redacted logs and alert bindings and stricter schema
enforcement.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, optional fields, redaction ref, alert
bindings, example log, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If events[].log_event_id is UNKNOWN → block Completeness Gate.
If events[].level is UNKNOWN → block Completeness Gate.
If events[].trigger is UNKNOWN → block Completeness Gate.
If events[].required_fields is UNKNOWN → block Completeness Gate.
If events[].correlation_required is UNKNOWN → block Completeness Gate.
If events[].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OBS
Pass conditions:
required_fields_present == true
log_event_registry_defined == true
correlation_defined == true
redaction_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OBS-06

OBS-06 — Redaction & Privacy Rules for Telemetry (PII/secret handling)
Header Block

## 5. Optional Fields

Example log line (redacted) | OPTIONAL
Alert bindings (alert_id list) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Never log tokens, secrets, raw PII; apply denylist/redaction standards.**
- **Every error-level log event must include correlation fields for traceability.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Log Events (repeat per log_event_id)`
3. `## Log Event`
4. `## OPTIONAL`
5. `## open_questions:`
6. `## (Repeat per log event.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:LTS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:OBS-07}} | OPTIONAL**
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
