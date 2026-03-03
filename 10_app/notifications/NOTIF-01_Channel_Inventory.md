# NOTIF-01 — Channel Inventory (email/sms/push/in-app)

## Header Block

| Field | Value |
|---|---|
| template_id | NOTIF-01 |
| title | Channel Inventory (email/sms/push/in-app) |
| type | notifications_channel_inventory |
| template_version | 1.0.0 |
| output_path | 10_app/notifications/NOTIF-01_Channel_Inventory.md |
| compliance_gate_id | TMP-05.PRIMARY.NOTIF |
| upstream_dependencies | ["MPUSH-01", "IXS-01"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "MPUSH-01", "MPUSH-02", "EVT-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Create the single, canonical inventory of notification channels used by the product
(email/SMS/push/in-app), including what each channel is used for, constraints, and which
downstream templates govern each channel. This document must not invent channel types
beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- MPUSH-01 Notification Types Catalog: {{mpush.types}} | OPTIONAL
- MPUSH-02 Push Payload Contract: {{mpush.payload_contract}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Channel registry (channel_id list)
- channel_id (email/sms/push/in_app)
- channel purpose (what it’s for)
- supported message types (transactional/marketing/UNKNOWN)
- delivery constraints (max length, attachments)
- PII/compliance constraints (consent)
- quiet hours applicability
- opt-out model (global/per-type)
- provider dependency (provider_id ref if any)
- telemetry requirements (send/deliver/fail)
- references to channel-specific specs (NOTIF-03..10 and MPUSH docs for push)

## Optional Fields

- Fallback channel rules | OPTIONAL
- Regional restrictions | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent channel_ids; use the allowed set {email, sms, push, in_app}.
- Each channel must define opt-out + consent handling for message types that require it.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

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

## Cross-References

Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-02}}, {{xref:NOTIF-04}}, {{xref:NOTIF-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define channels and purposes and opt-out model; no invention.
intermediate: Required. Add constraints/compliance and telemetry and spec refs.
advanced: Required. Add fallback/regional restrictions and traceability to provider/event IDs.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, provider refs, optional
telemetry metrics, secondary spec refs, fallback/regional restrictions, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If channels[].channel_id is UNKNOWN → block Completeness Gate.
If channels[].opt_out_model is UNKNOWN → block Completeness Gate.
If channels[].telemetry.send_metric is UNKNOWN → block Completeness Gate.
If channels[].spec_refs is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
channel_ids_valid == true
opt_out_models_defined == true
telemetry_defined == true
spec_refs_present == true
placeholder_resolution == true
no_unapproved_unknowns == true
