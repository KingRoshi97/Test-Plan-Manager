# AUDIT-01 — Audit Event Catalog (by event_type)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-01                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring audit event catalog (by event_type)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Audit Event Catalog (by event_type) Document                         |

## 2. Purpose

Create the canonical catalog of audit events that must be recorded across the system, indexed
by event_type. This catalog drives schema requirements, capture rules, alerts, and forensics
workflows. It must align with privileged actions, financial actions, and sensitive data access.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit trail spec (admin): {{xref:ADMIN-03}} | OPTIONAL
- API surface: {{xref:API-01}} | OPTIONAL
- AuthZ enforcement points: {{xref:IAM-04}} | OPTIONAL
- Payments ledger: {{xref:PAY-07}} | OPTIONAL
- File access control: {{xref:FMS-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Event type registry (event_type list)
event_type (stable identifier)
Category (auth/authz/admin/data/payment/file)
Triggering action (what causes it)
Actor (user/service/admin)
Target (resource type/id)
Minimum required fields (schema pointer)
Retention class (short/standard/long/UNKNOWN)
Sensitivity level (contains PII? yes/no/UNKNOWN)
Downstream consumers (alerts/forensics)
Telemetry requirements (events per type)

Optional Fields
Example payload | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every audit event type must be tied to a triggering action and capture at least actor+target.
Do not include raw secret material or full content bodies in audit payloads.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_event_types: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Event Types (repeat per event_type)
Event
event_type: {{events[0].event_type}}
category: {{events[0].category}}
trigger: {{events[0].trigger}}
actor_type: {{events[0].actor_type}}
target: {{events[0].target}}
required_fields: {{events[0].required_fields}}
retention_class: {{events[0].retention_class}}
contains_pii: {{events[0].contains_pii}}
consumers: {{events[0].consumers}}
telemetry_metric: {{events[0].telemetry_metric}}
example_payload: {{events[0].example_payload}} | OPTIONAL
open_questions:
{{events[0].open_questions[0]}} | OPTIONAL
(Repeat per event.)
3. References
Audit schema: {{xref:AUDIT-02}} | OPTIONAL
Capture rules: {{xref:AUDIT-03}} | OPTIONAL
Privileged audit: {{xref:AUDIT-07}} | OPTIONAL
Cross-References
Upstream: {{xref:ADMIN-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-02}}, {{xref:AUDIT-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define event types and categories and triggers.

intermediate: Required. Define required fields and retention class and consumers.
advanced: Required. Add example payloads and sensitivity/PII notes and telemetry rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, example payloads, consumers,
retention class, contains pii, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If events[].event_type is UNKNOWN → block Completeness Gate.
If events[].trigger is UNKNOWN → block Completeness Gate.
If events[].required_fields is UNKNOWN → block Completeness Gate.
If events[].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.AUDIT
Pass conditions:
required_fields_present == true
event_registry_defined == true
triggers_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

AUDIT-02

AUDIT-02 — Audit Schema (required fields, correlation IDs)
Header Block

## 5. Optional Fields

Example payload | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every audit event type must be tied to a triggering action and capture at least actor+target.**
- Do not include raw secret material or full content bodies in audit payloads.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Event Types (repeat per event_type)`
3. `## Event`
4. `## open_questions:`
5. `## (Repeat per event.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:ADMIN-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-02}}, {{xref:AUDIT-09}} | OPTIONAL**
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
