# PRIV-08 — Privacy by Design Checklist (per feature/data flow)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-08                                          |
| Template Type     | Security / Privacy                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring privacy by design checkli |
| Filled By         | Internal Agent                                   |
| Consumes          | PRIV-02, SKM-04, DATA-06                         |
| Produces          | Filled Privacy by Design Checklist (per feature/d|

## 2. Purpose

Define the canonical rules for anonymization and pseudonymization: what identifiers are hashed/tokenized, how salts/keys are managed, what counts as reversible vs irreversible transformation, and where these methods are used (logs, analytics, exports). This template must align with key usage rules and canonical data schemas.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Key types/usage: {{xref:SKM-04}} | OPTIONAL
- Canonical schemas: {{xref:DATA-06}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Transformation registry ( | spec         | No              |
| transform_id (stable iden | spec         | No              |
| Target fields (what is tr | spec         | No              |
| Method (hash/tokenize/enc | spec         | No              |
| Reversibility flag (rever | spec         | No              |
| Key/salt management rule  | spec         | No              |
| Where applied (logs/analy | spec         | No              |
| Collision/uniqueness expe | spec         | No              |
| Access control for revers | spec         | No              |
| Telemetry requirements (t | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Rotation impact notes     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not claim “anonymous” if reversible or if linkage remains feasible; call it pseudonymized.
- Salts/keys must be managed securely and rotated per SKM policies.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Privacy by Design Checklist (per feature/data flow)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PRIV-10}}, {{xref:COMP-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, collision/access rules, rotation impact,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If items[].transform_id is UNKNOWN → block Completeness Gate.
- If items[].fields is UNKNOWN → block Completeness Gate.
- If items[].method is UNKNOWN → block Completeness Gate.
- If items[].reversibility is UNKNOWN → block Completeness Gate.
- If items[*].telemetry_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PRIV
- Pass conditions:
- [ ] required_fields_present == true
- [ ] transform_registry_defined == true
- [ ] methods_and_reversibility_defined == true
- [ ] key_management_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PRIV-09
