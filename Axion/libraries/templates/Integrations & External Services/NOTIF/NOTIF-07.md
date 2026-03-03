# NOTIF-07 — Notification Batching & Digest Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-07                                         |
| Template Type     | Integration / Notifications                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring notification batching & d |
| Filled By         | Internal Agent                                   |
| Consumes          | NOTIF-06, IXS-08, CSec-02                        |
| Produces          | Filled Notification Batching & Digest Rules      |

## 2. Purpose

Define the canonical security and compliance requirements for notifications: PII handling, consent and opt-out enforcement, regulatory constraints (e.g., CAN-SPAM / SMS consent), data retention, and safe logging/redaction. This template must be consistent with integration security baseline and preference center rules.

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

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Data classification for n | spec         | No              |
| Consent requirements by c | spec         | No              |
| Marketing vs transactiona | spec         | No              |
| Unsubscribe requirements  | spec         | No              |
| Sender identity requireme | spec         | No              |
| PII minimization rules (w | spec         | No              |
| Logging/redaction rules ( | spec         | No              |
| Retention rules for notif | spec         | No              |
| Vendor risk notes (provid | spec         | No              |
| Telemetry requirements (c | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Regional compliance diffe | spec         | Enrichment only, no new truth  |
| Age-restricted user rules | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Opt-out and consent must be enforced at send time.
- Do not send sensitive PII in notifications unless explicitly approved and necessary.
- Logs must not store message bodies by default; store metadata only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Notification Batching & Digest Rules`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:NOTIF-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:NOTIF-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, optional channel consent rules, sms
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If data.pii_allowed_rule is UNKNOWN → block Completeness Gate.
- If unsub.email_required is UNKNOWN → block Completeness Gate.
- If logs.no_body_logging_rule is UNKNOWN → block Completeness Gate.
- If retention.log_retention is UNKNOWN → block Completeness Gate.
- If telemetry.blocked_send_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.NOTIF
- Pass conditions:
- [ ] required_fields_present == true
- [ ] consent_and_unsubscribe_defined == true
- [ ] pii_and_logging_rules_defined == true
- [ ] retention_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] NOTIF-08
