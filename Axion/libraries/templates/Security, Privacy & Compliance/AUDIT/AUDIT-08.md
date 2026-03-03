# AUDIT-08 — Audit Integration Spec (SIEM, compliance tools)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-08                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit integration spec (s |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-02, PRIV-02, SKM-09                        |
| Produces          | Filled Audit Integration Spec (SIEM, compliance t|

## 2. Purpose

Define the canonical redaction and PII handling rules specific to audit data: what can be stored, what must be hashed/masked, how access is controlled, and how audit exports are scrubbed. This template must align with PII tiering and global logging redaction rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Secrets/log redaction: {{xref:SKM-09}} | OPTIONAL
- Logging policy: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| PII handling rule (what i | spec         | No              |
| Hashing rules (which iden | spec         | No              |
| Masking rules for viewing | spec         | No              |
| Field allowlist/denylist  | spec         | No              |
| Export redaction rules    | spec         | No              |
| Access control rules (who | spec         | No              |
| Retention interaction rul | spec         | No              |
| Telemetry requirements (r | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Tier-specific handling ov | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Default to hashing identifiers; avoid raw PII in audit logs unless strictly required.
- Exports must apply redaction by default.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Integration Spec (SIEM, compliance tools)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-05}}, {{xref:AUDIT-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, allowed fields, hash method, unmask
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If fields.denylist is UNKNOWN → block Completeness Gate.
- If hash.fields is UNKNOWN → block Completeness Gate.
- If export.rule is UNKNOWN → block Completeness Gate.
- If retention.rule is UNKNOWN → block Completeness Gate.
- If telemetry.redaction_applied_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] hashing_and_denylist_defined == true
- [ ] export_redaction_defined == true
- [ ] retention_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-09
