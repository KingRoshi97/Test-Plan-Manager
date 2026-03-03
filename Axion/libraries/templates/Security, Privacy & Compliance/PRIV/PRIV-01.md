# PRIV-01 — Data Inventory & Classification

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-01                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring data inventory & classifi |
| Filled By         | Internal Agent                                   |
| Consumes          | DATA-06, DOMAIN_MAP, SPEC_INDEX                  |
| Produces          | Filled Data Inventory & Classification           |

## 2. Purpose

Create the canonical inventory of data the system collects/stores/processes, indexed by data_class and entity, including where it lives, who uses it, and sensitivity notes. This inventory anchors PII classification, minimization, and retention policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Canonical schemas: {{xref:DATA-06}} | OPTIONAL
- Event schemas: {{xref:EVT-02}} | OPTIONAL
- File metadata/indexing: {{xref:FMS-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Data class registry (data_class list) | No |
| Entity registry (entity_name list) | No |
| data_class (stable classification label) | No |
| entity_name (table/model) | No |
| Fields of interest (PII candidates) | No |
| Storage location (db/bucket/log/UNKNOWN) | Yes |
| Producers (who writes) | No |
| Consumers (who reads) | No |
| Primary purpose (why collected) | No |
| Retention reference (PRIV-05) | Yes |
| Sharing reference (PRIV-06) | Yes |
| Telemetry requirements (inventory coverage %) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Notes on lawful basis | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not invent entities; use DATA-06 and event schemas as primary sources.
- Every inventory entry must include purpose; if unknown, mark UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-02}}, {{xref:PRIV-03}}, {{xref:COMP-05}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. List classes/entities and purposes; use UNKNOWN when needed. |
| Intermediate | Required. Add producers/consumers and storage locations. |
| Advanced | Required. Add retention/sharing refs and coverage telemetry rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, retention/sharing refs, notes, lawful basis notes, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If classes.list is UNKNOWN → block Completeness Gate.
- If entities.list is UNKNOWN → block Completeness Gate.
- If items[*].purpose is UNKNOWN → block Completeness Gate.
- If telemetry.coverage_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PRIV
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] data_classes_and_entities_defined == true
- [ ] purposes_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

