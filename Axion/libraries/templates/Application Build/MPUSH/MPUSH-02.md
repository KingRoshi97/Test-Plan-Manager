# MPUSH-02 — Payload Contract (fields, routing, localization keys)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MPUSH-02                                             |
| Template Type     | Build / Push Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring payload contract (fields, routing, localization keys)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Payload Contract (fields, routing, localization keys) Document                         |

## 2. Purpose

Define the canonical push notification payload contract: required and optional fields, routing
fields to link notifications to in-app screens/actions, localization key requirements, and security
constraints. This template must be consistent with notification type catalog and deep link safety
rules and must not invent payload fields not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}}
- MDL-02 Routing Rules: {{mobile.routing_rules}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Optional payload field... | spec         | Yes             |
| Routing contract field... | spec         | Yes             |
| Localization keys cont... | spec         | Yes             |
| Versioning rules (payl... | spec         | Yes             |
| Security constraints (... | spec         | Yes             |
| Validation rules (reje... | spec         | Yes             |
| Max payload size policy   | spec         | Yes             |
| Telemetry fields (deli... | spec         | Yes             |

## 5. Optional Fields

Platform-specific fields (iOS/Android) | OPTIONAL
Encrypted payload section | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
No sensitive data in payload.
Routing targets MUST be allowlisted per deep link rules.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Schema Versioning
schema_version: {{schema.version}}
compat_policy: {{schema.compat_policy}} | OPTIONAL
2. Required Fields
notif_id: {{fields.required.notif_id}}
title_key: {{fields.required.title_key}}
body_key: {{fields.required.body_key}}
routing: {{fields.required.routing}}
delivery_id: {{fields.required.delivery_id}} | OPTIONAL
3. Optional Fields
collapse_key: {{fields.optional.collapse_key}} | OPTIONAL
sound: {{fields.optional.sound}} | OPTIONAL
badge: {{fields.optional.badge}} | OPTIONAL
priority: {{fields.optional.priority}} | OPTIONAL
4. Routing Contract
link_id: {{routing.link_id}} | OPTIONAL
target_route_id: {{routing.target_route_id}} | OPTIONAL
params: {{routing.params}} | OPTIONAL
action: {{routing.action}} | OPTIONAL
validation_rule: {{routing.validation_rule}}
5. Localization Keys
args_supported: {{l10n.args_supported}}
title_args: {{l10n.title_args}} | OPTIONAL
body_args: {{l10n.body_args}} | OPTIONAL
missing_key_behavior: {{l10n.missing_key_behavior}} | OPTIONAL
6. Validation
reject_unknown_fields: {{validate.reject_unknown_fields}}
required_field_policy: {{validate.required_field_policy}}
7. Size Policy
max_payload_bytes: {{size.max_payload_bytes}}
truncate_policy: {{size.truncate_policy}} | OPTIONAL
8. Security Constraints
no_pii_rule: {{security.no_pii_rule}}
signed_links_supported: {{security.signed_links_supported}} | OPTIONAL
signature_field: {{security.signature_field}} | OPTIONAL

9. Telemetry Fields
trace_id: {{telemetry.trace_id}} | OPTIONAL
sent_at: {{telemetry.sent_at}} | OPTIONAL
provider_message_id: {{telemetry.provider_message_id}} | OPTIONAL
10.References
Notification catalog: {{xref:MPUSH-01}}
Routing rules: {{xref:MDL-02}} | OPTIONAL
Secure deep links: {{xref:CSec-05}} | OPTIONAL
Delivery/retry: {{xref:MPUSH-04}} | OPTIONAL
Cross-References
Upstream: {{xref:MPUSH-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:MPUSH-04}}, {{xref:MPUSH-05}} | OPTIONAL
Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Not required.
intermediate: Required. Define required/optional fields and routing validation rule.
advanced: Required. Add versioning/size/security constraints and platform-specific fields.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, compat policy, delivery id, optional fields,
routing optional fields, localization args and missing behavior, truncate policy, signed link fields,
telemetry fields, platform fields, encrypted section, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If schema.version is UNKNOWN → block Completeness Gate.
If fields.required.notif_id is UNKNOWN → block Completeness Gate.
If routing.validation_rule is UNKNOWN → block Completeness Gate.
If security.no_pii_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.MPUSH
Pass conditions:
required_fields_present == true
payload_contract_defined == true
routing_validation_defined == true
security_constraints_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

MPUSH-03

MPUSH-03 — Permission & Opt-In Rules (platform specific)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **No sensitive data in payload.**
- **Routing targets MUST be allowlisted per deep link rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Schema Versioning`
2. `## Required Fields`
3. `## Optional Fields`
4. `## Routing Contract`
5. `## Localization Keys`
6. `## Validation`
7. `## Size Policy`
8. `## Security Constraints`
9. `## Telemetry Fields`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:MPUSH-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:MPUSH-04}}, {{xref:MPUSH-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
