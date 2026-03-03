# COMP-05 — Compliance Gap Analysis (current vs required controls)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-05                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring compliance gap analysis ( |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-06, COMP-03, IXS-01                         |
| Produces          | Filled Compliance Gap Analysis (current vs requir|

## 2. Purpose

Recipients/vendors (provider_id/service_id) Legal basis/consent ref (if applicable) Retention policy ref (PRIV-05) DPA pointer (where DPA stored) Owner (who maintains record) Review cadence Telemetry requirements (records complete, missing DPA)

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data sharing map: {{xref:PRIV-06}} | OPTIONAL
- Vendor risk management: {{xref:COMP-03}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Processing record registr | spec         | No              |
| record_id (stable identif | spec         | No              |
| Processing activity name  | spec         | No              |
| Data categories processed | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Cross-border transfer not | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Every external processor should have a DPA pointer (or explicit exception).
- Records must be kept current and review cadence enforced.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Compliance Gap Analysis (current vs required controls)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRIV-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, legal basis ref, retention ref, transfer
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If records[].record_id is UNKNOWN → block Completeness Gate.
- If records[].purpose is UNKNOWN → block Completeness Gate.
- If records[].recipients is UNKNOWN → block Completeness Gate.
- If records[].dpa_pointer is UNKNOWN → block Completeness Gate.
- If records[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] records_defined == true
- [ ] dpa_pointers_defined == true
- [ ] cadence_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-06
