# CRMERP-07 — Rate Limit & Quota Management (per provider)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-07                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rate limit & quota manage |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-02, IXS-05, DQV-03                        |
| Produces          | Filled Rate Limit & Quota Management (per provide|

## 2. Purpose

Define the canonical data quality and validation rules for CRM/ERP sync: required fields, schema validation, normalization, deduplication, and how invalid records are handled (reject/quarantine/repair). This template must be consistent with mapping rules and canonical validation standards and must not invent data fields beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-02 Object/Entity Mapping: {{crmerp.mapping}}
- IXS-05 Data Mapping & Transforms: {{ixs.data_mapping}} | OPTIONAL
- DQV-03 Data Validation Rules: {{dqv.rules}} | OPTIONAL
- API-03 Error/Status Code Policy: {{api.error_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Validation stages (ingest | spec         | No              |
| Per-object required field | spec         | No              |
| Schema validation rules ( | spec         | No              |
| Normalization rules (stri | spec         | No              |
| Deduplication keys and wi | spec         | No              |
| Invalid record handling ( | spec         | No              |
| Data repair workflow (ope | spec         | No              |
| Telemetry requirements (i | spec         | No              |
| Audit requirements for re | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Sampling/quality reportin | spec         | Enrichment only, no new truth  |
| PII redaction during vali | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Required fields must be explicit and consistent with canonical schemas.
- Deduplication rules must be deterministic; avoid fuzzy matching unless defined.
- Invalid records must not silently pass into system-of-record.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Rate Limit & Quota Management (per provider)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, schema ref, normalization rules,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If stages.list is UNKNOWN → block Completeness Gate.
- If required list is UNKNOWN → block Completeness Gate.
- If schema.on_fail is UNKNOWN → block Completeness Gate.
- If invalid.behavior is UNKNOWN → block Completeness Gate.
- If telemetry.invalid_record_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] validation_stages_defined == true
- [ ] required_fields_per_object_defined == true
- [ ] dedupe_defined == true
- [ ] invalid_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-08
