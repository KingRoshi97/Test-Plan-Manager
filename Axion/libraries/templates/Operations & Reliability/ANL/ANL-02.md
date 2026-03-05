# ANL-02 — Event Taxonomy (by event_name)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-02                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event taxonomy (by event_name)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Taxonomy (by event_name) Document                         |

## 2. Purpose

Create the canonical taxonomy of analytics events, indexed by event_name, including naming
conventions, when each event fires, and ownership. This taxonomy is the source of truth for
analytics instrumentation and must align with privacy/consent rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Analytics overview: {{xref:ANL-01}} | OPTIONAL
- Telemetry schema standard: {{xref:OBS-02}} | OPTIONAL
- Consent model: {{xref:PRIV-04}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Data binding rules: {{xref:FE-04}} | OPTIONAL
- Mobile screen bindings: {{xref:MOB-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Event registry (event_name list)
event_name (stable identifier)
Category (screen, action, system, funnel)
Trigger definition (when fired)
Source surface (web/mobile/backend)
Required properties list (property names)
Allowed properties list (safe fields)
Consent requirement (consent_id or NONE/UNKNOWN)
PII rule (must not include tier-X data)
Owner (team)
Primary KPI/funnel linkage (kpi_id) | OPTIONAL
Telemetry requirements (event drop rate per event)

Optional Fields
Example payload (redacted) | OPTIONAL
Deprecation rule (rename/version) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Event names must follow a consistent convention (e.g., noun_verb or screen.view).
No raw PII in event properties; use allowed properties only.
If consent is required, the event must not fire without it.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Naming Convention
event_name_rule: {{names.event_name_rule}}
examples: {{names.examples}} | OPTIONAL
2. Events (repeat per event_name)
Event
event_name: {{events[0].event_name}}
category: {{events[0].category}}
trigger: {{events[0].trigger}}
surface: {{events[0].surface}}
required_properties: {{events[0].required_properties}}
allowed_properties: {{events[0].allowed_properties}}
consent_requirement: {{events[0].consent_requirement}}
pii_rule: {{events[0].pii_rule}}
owner: {{events[0].owner}}
kpi_link: {{events[0].kpi_link}} | OPTIONAL
example_payload: {{events[0].example_payload}} | OPTIONAL
deprecation_rule: {{events[0].deprecation_rule}} | OPTIONAL
telemetry_metric: {{events[0].telemetry_metric}}
open_questions:
{{events[0].open_questions[0]}} | OPTIONAL
(Repeat per event.)
3. References
Event schema spec: {{xref:ANL-03}} | OPTIONAL
Identity model: {{xref:ANL-04}} | OPTIONAL
Consent model: {{xref:PRIV-04}} | OPTIONAL
Cross-References
Upstream: {{xref:ANL-01}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:ANL-03}}, {{xref:ANL-07}}, {{xref:ANL-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define event registry and triggers and required/allowed properties.
intermediate: Required. Define consent requirements and PII rules and owners.
advanced: Required. Add deprecation/versioning policy and KPI linkage and example payloads.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, examples, kpi link, example payload,
deprecation rule, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If events[].event_name is UNKNOWN → block Completeness Gate.
If events[].trigger is UNKNOWN → block Completeness Gate.
If events[].required_properties is UNKNOWN → block Completeness Gate.
If events[].allowed_properties is UNKNOWN → block Completeness Gate.
If events[].pii_rule is UNKNOWN → block Completeness Gate.
If events[].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ANL
Pass conditions:
required_fields_present == true
event_registry_defined == true
properties_defined == true
privacy_and_consent_defined == true
ownership_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ANL-03

ANL-03 — Event Schema Spec (payload rules, versioning)
Header Block

## 5. Optional Fields

Example payload (redacted) | OPTIONAL
Deprecation rule (rename/version) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Event names must follow a consistent convention (e.g., noun_verb or screen.view).**
- **No raw PII in event properties; use allowed properties only.**
- If consent is required, the event must not fire without it.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Naming Convention`
2. `## Events (repeat per event_name)`
3. `## Event`
4. `## open_questions:`
5. `## (Repeat per event.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:ANL-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-03}}, {{xref:ANL-07}}, {{xref:ANL-10}} | OPTIONAL**
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
