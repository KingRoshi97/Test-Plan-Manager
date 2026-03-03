# IXS-05 — Error Handling & Retry Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-05                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error handling & retry po |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-02, DATA-06, DQV-03                          |
| Produces          | Filled Error Handling & Retry Policy             |

## 2. Purpose

Define the canonical mapping between external system fields and internal schemas/entities, including transforms/normalization, validation rules, defaulting, and error handling for unmapped or invalid data. This template must be consistent with canonical data schemas and must not invent schema fields beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-02 Integration Specs: `{{ixs.integration_specs}}`
- DATA-06 Canonical Data Schemas: `{{data.schemas}}` | OPTIONAL
- DQV-03 Data Validation Rules: `{{data.validation_rules}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| integration_id binding | Bound to IXS-01 |
| Mapping registry | map_id list |
| map_id | Stable identifier |
| external object name | Vendor object/event |
| internal schema/entity ref | schema_ref/entity_id |
| primary key mapping | External id → internal id |
| field mapping list | external_field → internal_path |
| transform rules | Trim, case, units, timezone |
| defaulting rules | Missing values |
| validation binding | DQV-03 / schema constraints |
| unknown/unmapped field policy | Policy for unknown fields |
| PII handling rules | Redaction/storage constraints |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Bidirectional mapping notes | OPTIONAL |
| Enum mapping tables | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not invent schema paths; use only valid refs from `{{xref:DATA-06}}`.
- Transform rules must be deterministic (same input → same output).
- Unmapped required fields MUST cause explicit failure or explicit defaulting; no silent drops.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-02}}`, `{{xref:DATA-06}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-06}}`, `{{xref:IXS-07}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-PII-REDACTION]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define map entries and core field mappings; use UNKNOWN for optional transforms.
- **intermediate**: Required. Add deterministic transforms and validation bindings.
- **advanced**: Required. Add enum tables, bidirectional notes, and strict unmapped handling.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, meta notes, field required/transform/default/validation refs, global transform rules, dqv ref, pii fields, storage constraints, enum tables, bidirectional notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `meta.integration_id` is UNKNOWN → block Completeness Gate.
- If `maps[*].internal_ref` is UNKNOWN → block Completeness Gate.
- If `unknown.unmapped_required_behavior` is UNKNOWN → block Completeness Gate.
- If `pii.redaction_rule` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] map_ids_unique == true
- [ ] integration_id_exists_in_inventory == true
- [ ] all internal_path references are valid (DATA-06)
- [ ] unmapped_required_behavior_defined == true
- [ ] pii_handling_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

