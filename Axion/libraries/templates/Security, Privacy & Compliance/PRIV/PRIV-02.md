# PRIV-02 — Privacy Impact Assessment

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-02                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring privacy impact assessment |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-01, SEC-01                                  |
| Produces          | Filled Privacy Impact Assessment                 |

## 2. Purpose

Define the canonical PII classification model used across the system: what counts as PII, sensitivity tiers, examples, and handling expectations. This template must align with security posture and file/media PII rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Security overview: {{xref:SEC-01}} | OPTIONAL
- File security/compliance: {{xref:FMS-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| PII definition statement | No |
| Sensitivity tiers list (tier_id list) | No |
| Tier definitions (what included) | No |
| PII types registry (email, phone, address, biometrics, etc.) | No |
| Special categories (children, health, financial) | Yes |
| Handling rules per tier (store/share/log) | No |
| Redaction rules per tier (logs/analytics) | No |
| Telemetry requirements (pii violations detected) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Jurisdiction-specific notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Classification must be usable by engineers (clear examples).
- Higher tiers must have stricter logging/sharing prohibitions.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-03}}, {{xref:PRIV-06}}, {{xref:COMP-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define tiers and basic handling/redaction rules. |
| Intermediate | Required. Define types registry and special categories and telemetry. |
| Advanced | Required. Add jurisdiction notes and tighter tier examples and enforcement pointers. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, special categories, jurisdiction notes, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If pii.definition is UNKNOWN → block Completeness Gate.
- If tiers.list is UNKNOWN → block Completeness Gate.
- If tiers.items[*].handling_rules is UNKNOWN → block Completeness Gate.
- If telemetry.pii_violation_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PRIV
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] tiers_defined == true
- [ ] handling_and_redaction_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

