# NOTIF-07 — Security & Compliance (PII, CAN-SPAM, consent)

## Header Block

| Field | Value |
|---|---|
| template_id | NOTIF-07 |
| title | Security & Compliance (PII, CAN-SPAM, consent) |
| type | notifications_security_compliance |
| template_version | 1.0.0 |
| output_path | 10_app/notifications/NOTIF-07_Security_Compliance.md |
| compliance_gate_id | TMP-05.PRIMARY.NOTIF |
| upstream_dependencies | ["NOTIF-06", "IXS-08", "CSec-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "NOTIF-01", "NOTIF-06", "IXS-08", "CSec-02", "CER-05"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical security and compliance requirements for notifications: PII handling,
consent and opt-out enforcement, regulatory constraints (e.g., CAN-SPAM / SMS consent), data
retention, and safe logging/redaction. This template must be consistent with integration security
baseline and preference center rules.

## Inputs Required

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

## Required Fields

- Data classification for notification content (PII/no PII)
- Consent requirements by channel (email/sms/push/in-app)
- Marketing vs transactional enforcement rules
- Unsubscribe requirements (email footer, SMS STOP)
- Sender identity requirements (from domain/phone)
- PII minimization rules (what is allowed in message bodies)
- Logging/redaction rules (no message body logs)
- Retention rules for notification logs/events
- Vendor risk notes (provider compliance)
- Telemetry requirements (consent violations, blocked sends)

## Optional Fields

- Regional compliance differences | OPTIONAL
- Age-restricted user rules | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Opt-out and consent must be enforced at send time.
- Do not send sensitive PII in notifications unless explicitly approved and necessary.
- Logs must not store message bodies by default; store metadata only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

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

## Cross-References

Upstream: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:NOTIF-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define consent rules and no-body-logging and unsubscribe requirements.
intermediate: Required. Define PII minimization and retention and vendor notes.
advanced: Required. Add regional/age rules and stricter telemetry and auditability.

## Unknown Handling

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

## Completeness Gate

Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
consent_and_unsubscribe_defined == true
pii_and_logging_rules_defined == true
retention_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
