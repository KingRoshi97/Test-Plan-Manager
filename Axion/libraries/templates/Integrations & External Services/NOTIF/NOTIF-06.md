# NOTIF-06 — Preference Center & Opt-Out Rules (global/per-type)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-06                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring preference center & opt-out rules (global/per-type)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Preference Center & Opt-Out Rules (global/per-type) Document                         |

## 2. Purpose

Define the canonical preference center model and opt-out rules: how users control notification
settings globally and per-type, how consent is recorded, and how opt-outs are enforced across
channels/providers. This template must be consistent with send policy and deliverability
suppression rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-03 Template/Notification Mapping: {{notif.template_mapping}} | OPTIONAL
- FE-01 Route Map/Layout: {{fe.routes}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Preference model (global + per-type)
Preference entity fields (user_id, channel, notif_type)
Default opt-in states (per type/channel)
Opt-out enforcement rules (at send time)
Unsubscribe link behavior (email)
Channel-specific opt-out rules (sms STOP, push OS settings)
Transactional vs marketing rules (cannot opt-out transactional?)
Consent capture rules (when/how recorded)
Data retention for preferences
Telemetry requirements (opt-out rate, preference changes)

Optional Fields
Per-tenant preference overrides | OPTIONAL
Double opt-in policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Opt-out must be enforced server-side at send time.
Consent must be explicit where required; do not default opt-in for marketing unless allowed.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Preference Model
model: {{prefs.model}} (global_plus_per_type/UNKNOWN)
supported_channels: {{prefs.supported_channels}}
2. Preference Entity
fields: {{prefs.entity_fields}}
storage_location: {{prefs.storage_location}} | OPTIONAL
3. Defaults
default_states: {{prefs.default_states}}
4. Enforcement
enforce_at_send_time: {{enforce.at_send_time}}
suppression_interaction_rule: {{enforce.suppression_interaction_rule}} | OPTIONAL
5. Unsubscribe Mechanisms
email_unsubscribe_rule: {{unsub.email_rule}}
sms_unsubscribe_rule: {{unsub.sms_rule}} | OPTIONAL
push_unsubscribe_rule: {{unsub.push_rule}} | OPTIONAL
6. Transactional vs Marketing
classification_rule: {{class.rule}}
marketing_opt_in_required: {{class.marketing_opt_in_required}} | OPTIONAL
transactional_opt_out_allowed: {{class.transactional_opt_out_allowed}}
7. Consent Capture
capture_points: {{consent.capture_points}}
consent_fields: {{consent.fields}} | OPTIONAL
8. Retention
retention_policy: {{retention.policy}}
9. Telemetry
preference_change_metric: {{telemetry.preference_change_metric}}
opt_out_metric: {{telemetry.opt_out_metric}} | OPTIONAL
10.References
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Deliverability/suppression: {{xref:NOTIF-05}} | OPTIONAL
Template mapping: {{xref:NOTIF-03}} | OPTIONAL
Push permission rules: {{xref:MPUSH-03}} | OPTIONAL

Cross-References
Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-07}}, {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define defaults, unsubscribe mechanisms, and enforce_at_send_time.
intermediate: Required. Define entity fields, consent capture, and transactional vs marketing
rules.
advanced: Required. Add double opt-in and suppression interaction and telemetry rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, storage location, suppression interaction,
sms/push rules, marketing opt-in, consent fields, opt-out metric, overrides, double opt-in,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If prefs.default_states is UNKNOWN → block Completeness Gate.
If enforce.at_send_time is UNKNOWN → block Completeness Gate.
If unsub.email_rule is UNKNOWN → block Completeness Gate.
If retention.policy is UNKNOWN → block Completeness Gate.
If telemetry.preference_change_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
defaults_defined == true
unsubscribe_defined == true
enforcement_defined == true
consent_and_retention_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-07

NOTIF-07 — Security & Compliance (PII, CAN-SPAM, consent)
Header Block

## 5. Optional Fields

Per-tenant preference overrides | OPTIONAL
Double opt-in policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Opt-out must be enforced server-side at send time.**
- **Consent must be explicit where required; do not default opt-in for marketing unless allowed.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Preference Model`
2. `## Preference Entity`
3. `## Defaults`
4. `## Enforcement`
5. `## Unsubscribe Mechanisms`
6. `## Transactional vs Marketing`
7. `## Consent Capture`
8. `## Retention`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-07}}, {{xref:NOTIF-10}} | OPTIONAL**
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
