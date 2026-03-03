# CRMERP-02 — Entity Mapping Spec (internal ↔ external field map)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-02                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring entity mapping spec (inte |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-01, IXS-05, DATA-06                       |
| Produces          | Filled Entity Mapping Spec (internal ↔ external f|

## 2. Purpose

Define the canonical catalog mapping CRM/ERP objects to internal entities/schemas, including key mappings, field-level mapping references, and normalization/validation bindings. This template must be consistent with canonical schemas and integration mapping rules and must not invent object names or schema paths beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- IXS-05 Data Mapping & Transformation Rules: {{ixs.data_mapping}} | OPTIONAL
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{data.validation_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Mapping registry (mapping | spec         | No              |
| external_object name      | spec         | No              |
| internal entity/schema re | spec         | No              |
| primary key mapping (exte | spec         | No              |
| foreign key/reference map | spec         | No              |
| field mapping reference ( | spec         | No              |
| sync direction per object | spec         | No              |
| create/update semantics ( | spec         | No              |
| delete semantics (soft de | spec         | No              |
| validation binding (DQV-0 | spec         | No              |
| PII/data class notes      | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Lookup resolution rules   | spec         | Enrichment only, no new truth  |
| Object-specific constrain | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent schema refs; only use valid refs from {{xref:DATA-06}}.
- Each external object MUST map to exactly one primary internal entity/schema (or explicitly
- document composite mapping).
- Key mapping MUST be explicit; no “match by name” without deterministic rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Entity Mapping Spec (internal ↔ external field map)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-01}}, {{xref:DATA-06}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:CRMERP-03}}, {{xref:CRMERP-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, foreign keys, field
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If meta.system_id is UNKNOWN → block Completeness Gate.
- If maps[].internal_ref is UNKNOWN → block Completeness Gate.
- If maps[].primary_key_map is UNKNOWN → block Completeness Gate.
- If maps[*].upsert_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] system_id_exists_in_CRMERP_01 == true
- [ ] mapping_ids_unique == true
- [ ] all internal_ref values valid (DATA-06)
- [ ] primary_keys_and_upsert_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-03
