# PRIV-03 — Data Processing Registry

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-03                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data processing registry  |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-01, PRIV-02, PRD-01                         |
| Produces          | Filled Data Processing Registry                  |

## 2. Purpose

Define the canonical data minimization rules: what data is allowed to be collected/stored/shared, what is prohibited, and how teams justify data collection. This template must align with the data inventory and PII tiering model.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Product overview/scope: {{xref:PRD-01}} | OPTIONAL
- File security: {{xref:FMS-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Minimization principles list | No |
| Collection rules (only collect if needed) | No |
| Storage rules (store minimum, prefer derived) | No |
| Sharing rules (default no sharing) | No |
| Prohibited data categories (by tier/type) | No |
| Justification process (what required to add new data) | No |
| Approval roles (who approves new data collection) | No |
| Telemetry requirements (minimization violations, new fields added) | No |
| Reference to deletion/retention policy (PRIV-05) | Yes |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Examples of allowed vs disallowed | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Default is minimize: if not needed for a defined purpose, do not collect/store.
- New data collection must be reviewed/approved.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-05}}, {{xref:COMP-05}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define principles, prohibited data, and approvals. |
| Intermediate | Required. Define justification fields and telemetry and sharing rules. |
| Advanced | Required. Add examples and strict "new field" governance and audit trails. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, optional tiers, workflow steps, optional metrics, examples, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If principles is UNKNOWN → block Completeness Gate.
- If ban.types is UNKNOWN → block Completeness Gate.
- If approve.roles is UNKNOWN → block Completeness Gate.
- If telemetry.violation_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PRIV
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] principles_defined == true
- [ ] prohibited_data_defined == true
- [ ] approvals_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

