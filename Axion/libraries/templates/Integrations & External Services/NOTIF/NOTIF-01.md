# NOTIF-01 — Channel Inventory (email/sms/push/in-app)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-01                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring channel inventory (email/sms/push/in-app)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Channel Inventory (email/sms/push/in-app) Document                         |

## 2. Purpose

Create the single, canonical inventory of notification channels used by the product
(email/SMS/push/in-app), including what each channel is used for, constraints, and which
downstream templates govern each channel. This document must not invent channel types
beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}} | OPTIONAL
- MPUSH-02 Push Payload Contract: {{mpush.payload_contract}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Channel registry (channel_id list)
channel_id (email/sms/push/in_app)
channel purpose (what it’s for)
supported message types (transactional/marketing/UNKNOWN)
delivery constraints (max length, attachments)
PII/compliance constraints (consent)
quiet hours applicability
opt-out model (global/per-type)
provider dependency (provider_id ref if any)
telemetry requirements (send/deliver/fail)
references to channel-specific specs (NOTIF-03..10 and MPUSH docs for push)

Optional Fields
Fallback channel rules | OPTIONAL
Regional restrictions | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not invent channel_ids; use the allowed set {email, sms, push, in_app}.
Each channel must define opt-out + consent handling for message types that require it.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Inventory Summary
total_channels: {{inv.total}}
notes: {{inv.notes}} | OPTIONAL
2. Channel Entries (by channel_id)
Channel
channel_id: {{channels[0].channel_id}}
purpose: {{channels[0].purpose}}
message_types: {{channels[0].message_types}}
constraints: {{channels[0].constraints}}
compliance_constraints: {{channels[0].compliance_constraints}}
quiet_hours_applicable: {{channels[0].quiet_hours_applicable}}
opt_out_model: {{channels[0].opt_out_model}}
provider_ref: {{channels[0].provider_ref}} | OPTIONAL
telemetry:
send_metric: {{channels[0].telemetry.send_metric}}
deliver_metric: {{channels[0].telemetry.deliver_metric}} | OPTIONAL
fail_metric: {{channels[0].telemetry.fail_metric}} | OPTIONAL
spec_refs:
● {{channels[0].spec_refs[0]}} (e.g., {{xref:NOTIF-04}} / {{xref:NOTIF-06}} /
{{xref:MPUSH-01}})
● {{channels[0].spec_refs[1]}} | OPTIONAL
open_questions:
{{channels[0].open_questions[0]}} | OPTIONAL
(Repeat per channel_id.)
3. References
Provider inventory: {{xref:NOTIF-02}} | OPTIONAL
Template/localization mapping: {{xref:NOTIF-03}} | OPTIONAL
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Deliverability: {{xref:NOTIF-05}} | OPTIONAL
Preference center: {{xref:NOTIF-06}} | OPTIONAL

Security/compliance: {{xref:NOTIF-07}} | OPTIONAL
Event→notification mapping: {{xref:NOTIF-08}} | OPTIONAL
Failure handling: {{xref:NOTIF-09}} | OPTIONAL
Observability/runbooks: {{xref:NOTIF-10}} | OPTIONAL
Push catalog: {{xref:MPUSH-01}} | OPTIONAL
Cross-References
Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-02}}, {{xref:NOTIF-04}}, {{xref:NOTIF-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define channels and purposes and opt-out model; no invention.
intermediate: Required. Add constraints/compliance and telemetry and spec refs.
advanced: Required. Add fallback/regional restrictions and traceability to provider/event IDs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, provider refs, optional
telemetry metrics, secondary spec refs, fallback/regional restrictions, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If channels[].channel_id is UNKNOWN → block Completeness Gate.
If channels[].opt_out_model is UNKNOWN → block Completeness Gate.
If channels[].telemetry.send_metric is UNKNOWN → block Completeness Gate.
If channels[].spec_refs is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
channel_ids_valid == true
opt_out_models_defined == true
telemetry_defined == true
spec_refs_present == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-02

NOTIF-02 — Provider Inventory (by provider_id)
Header Block

## 5. Optional Fields

Fallback channel rules | OPTIONAL
Regional restrictions | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent channel_ids; use the allowed set {email, sms, push, in_app}.
- Each channel must define opt-out + consent handling for message types that require it.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Channel Entries (by channel_id)`
3. `## Channel`
4. `## telemetry:`
5. `## spec_refs:`
6. `## open_questions:`
7. `## (Repeat per channel_id.)`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-02}}, {{xref:NOTIF-04}}, {{xref:NOTIF-06}} | OPTIONAL**
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
