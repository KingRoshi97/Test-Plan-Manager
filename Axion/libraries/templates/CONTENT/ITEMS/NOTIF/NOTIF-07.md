# NOTIF-07 — Security & Compliance (PII, CAN-SPAM, consent)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-07                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security & compliance (pii, can-spam, consent)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security & Compliance (PII, CAN-SPAM, consent) Document                         |

## 2. Purpose

Define the canonical security and compliance requirements for notifications: PII handling,
consent and opt-out enforcement, regulatory constraints (e.g., CAN-SPAM / SMS consent), data
retention, and safe logging/redaction. This template must be consistent with integration security
baseline and preference center rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-06 Preference Center/Opt-Out Rules: {{notif.prefs}} | OPTIONAL
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Data classification for notification content (PII/no PII)
Consent requirements by channel (email/sms/push/in-app)
Marketing vs transactional enforcement rules
Unsubscribe requirements (email footer, SMS STOP)
Sender identity requirements (from domain/phone)
PII minimization rules (what is allowed in message bodies)
Logging/redaction rules (no message body logs)
Retention rules for notification logs/events
Vendor risk notes (provider compliance)
Telemetry requirements (consent violations, blocked sends)

Optional Fields
Regional compliance differences | OPTIONAL
Age-restricted user rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Opt-out and consent must be enforced at send time.
Do not send sensitive PII in notifications unless explicitly approved and necessary.
Logs must not store message bodies by default; store metadata only.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Data Classification
allowed_content_classes: {{data.allowed_content_classes}}
pii_allowed_rule: {{data.pii_allowed_rule}}
2. Consent Requirements
email_consent_rule: {{consent.email_rule}}
sms_consent_rule: {{consent.sms_rule}} | OPTIONAL
push_consent_rule: {{consent.push_rule}} | OPTIONAL
in_app_consent_rule: {{consent.in_app_rule}} | OPTIONAL
3. Marketing vs Transactional
classification_rule: {{class.rule}}
marketing_enforcement: {{class.marketing_enforcement}}
transactional_enforcement: {{class.transactional_enforcement}} | OPTIONAL
4. Unsubscribe Requirements
email_unsubscribe_required: {{unsub.email_required}}
sms_stop_required: {{unsub.sms_stop_required}} | OPTIONAL
5. Sender Identity
from_domain_policy: {{sender.from_domain_policy}}
sms_sender_policy: {{sender.sms_sender_policy}} | OPTIONAL
6. PII Minimization
allowed_fields_in_body: {{pii.allowed_fields_in_body}}
forbidden_fields_in_body: {{pii.forbidden_fields_in_body}} | OPTIONAL
7. Logging / Redaction
no_body_logging_rule: {{logs.no_body_logging_rule}}
metadata_fields_allowed: {{logs.metadata_fields_allowed}} | OPTIONAL
redaction_rule: {{logs.redaction_rule}} | OPTIONAL
8. Retention
notification_log_retention: {{retention.log_retention}}
suppression_retention: {{retention.suppression_retention}} | OPTIONAL
9. Vendor Risk
provider_compliance_notes: {{vendor.compliance_notes}}
security_review_required: {{vendor.security_review_required}} | OPTIONAL

10.Telemetry
blocked_send_metric: {{telemetry.blocked_send_metric}}
consent_violation_metric: {{telemetry.consent_violation_metric}} | OPTIONAL
11.References
Preference center: {{xref:NOTIF-06}} | OPTIONAL
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Deliverability: {{xref:NOTIF-05}} | OPTIONAL
Integration security baseline: {{xref:IXS-08}} | OPTIONAL
Client data protection: {{xref:CSec-02}} | OPTIONAL
Cross-References
Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define consent rules and no-body-logging and unsubscribe requirements.
intermediate: Required. Define PII minimization and retention and vendor notes.
advanced: Required. Add regional/age rules and stricter telemetry and auditability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional channel consent rules, sms
sender policy, forbidden fields list, metadata fields, redaction rule, suppression retention,
security review, consent violation metric, regional/age rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If data.pii_allowed_rule is UNKNOWN → block Completeness Gate.
If unsub.email_required is UNKNOWN → block Completeness Gate.
If logs.no_body_logging_rule is UNKNOWN → block Completeness Gate.
If retention.log_retention is UNKNOWN → block Completeness Gate.
If telemetry.blocked_send_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
consent_and_unsubscribe_defined == true
pii_and_logging_rules_defined == true
retention_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

NOTIF-08

NOTIF-08 — Event-to-Notification Mapping (events → messages)
Header Block

## 5. Optional Fields

Regional compliance differences | OPTIONAL
Age-restricted user rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Opt-out and consent must be enforced at send time.**
- Do not send sensitive PII in notifications unless explicitly approved and necessary.
- **Logs must not store message bodies by default; store metadata only.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Data Classification`
2. `## Consent Requirements`
3. `## Marketing vs Transactional`
4. `## Unsubscribe Requirements`
5. `## Sender Identity`
6. `## PII Minimization`
7. `## Logging / Redaction`
8. `## Retention`
9. `## Vendor Risk`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:NOTIF-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
