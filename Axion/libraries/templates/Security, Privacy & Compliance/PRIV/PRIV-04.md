# PRIV-04 — Data Retention Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-04                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data retention policy     |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-01, NOTIF-06, COMP-06                       |
| Produces          | Filled Data Retention Policy                     |

## 2. Purpose

Define the canonical consent model for the product: what consent types exist, how consent is captured, stored, updated, and enforced across features (including communications preferences). This template must align with notification preference rules and regulatory requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Notification preferences: {{xref:NOTIF-06}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Route contract (consent UX surfaces): {{xref:ROUTE-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Consent types registry (consent_id list) | No |
| consent_id (stable identifier) | No |
| What the consent covers (data use / comms / tracking) | No |
| Capture points (screens/actions) | No |
| Proof fields stored (timestamp, source, user_id) | No |
| Withdrawal/update rules (how revoked) | No |
| Enforcement points (where checked) | No |
| Default state rule (opt-in/opt-out) | Yes |
| Retention rule for consent records | No |
| Telemetry requirements (consent changes, violations) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Age-based consent rules | OPTIONAL |
| Per-jurisdiction overrides | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Consent enforcement must be server-side where relevant (not only UI).
- Withdrawal must be honored promptly and consistently.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-06}}, {{xref:COMP-05}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define consent registry and withdrawal/enforcement points. |
| Intermediate | Required. Define proof fields, retention, and telemetry metrics. |
| Advanced | Required. Add jurisdiction/age overrides and strict enforcement mappings. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, meta notes, jurisdiction/age rules, consent violation metric, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If consents[].consent_id is UNKNOWN → block Completeness Gate.
- If consents[].withdrawal_rule is UNKNOWN → block Completeness Gate.
- If consents[].enforcement_points is UNKNOWN → block Completeness Gate.
- If consents[].retention_policy is UNKNOWN → block Completeness Gate.
- If consents[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PRIV
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] consent_registry_defined == true
- [ ] withdrawal_and_enforcement_defined == true
- [ ] retention_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

