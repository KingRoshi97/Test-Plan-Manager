# AUDIT-04 — Audit Access Control (who can read/export/delete)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-04                                         |
| Template Type     | Security / Audit                                 |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring audit access control (who |
| Filled By         | Internal Agent                                   |
| Consumes          | AUDIT-03, SKM-04, SEC-02                         |
| Produces          | Filled Audit Access Control (who can read/export/|

## 2. Purpose

Define the canonical integrity and tamper-evidence mechanisms for audit logs: append-only storage properties, hashing/chaining, signing, verification checks, and access restrictions. This template must align with key usage rules and compliance control expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Capture rules: {{xref:AUDIT-03}} | OPTIONAL
- Key usage rules: {{xref:SKM-04}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Compliance controls: {{xref:COMP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Integrity model (append-o | spec         | No              |
| Hashing algorithm rule (o | spec         | No              |
| Chaining rule (prev_hash) | spec         | No              |
| Signing rule (if any)     | spec         | No              |
| Key management reference  | spec         | No              |
| Verification process (per | spec         | No              |
| Access control rule (who  | spec         | No              |
| Retention interaction (ca | spec         | No              |
| Telemetry requirements (i | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| External WORM storage not | spec         | Enrichment only, no new truth  |
| Legal evidentiary notes   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Audit logs must be tamper-evident; edits must be impossible or detectable.
- Keys used for signing must be protected and rotated per SKM.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Audit Access Control (who can read/export/delete)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:AUDIT-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:AUDIT-06}}, {{xref:COMP-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, signing rules/refs, evidence artifact,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If model.append_only_rule is UNKNOWN → block Completeness Gate.
- If hash.chain_rule is UNKNOWN → block Completeness Gate.
- If verify.cadence is UNKNOWN → block Completeness Gate.
- If retain.no_edit_no_delete_rule is UNKNOWN → block Completeness Gate.
- If telemetry.integrity_failure_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.AUDIT
- Pass conditions:
- [ ] required_fields_present == true
- [ ] integrity_model_defined == true
- [ ] verification_defined == true
- [ ] access_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] AUDIT-05
