# COMP-02 — Control Catalog (by framework: control ID, description)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-02                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring control catalog (by frame |
| Filled By         | Internal Agent                                   |
| Consumes          | COMP-01, SEC-03, PRIV-07                         |
| Produces          | Filled Control Catalog (by framework: control ID,|

## 2. Purpose

Create the canonical control matrix mapping compliance controls to security/privacy requirements and the evidence needed to prove them. This document is used for audits and internal assurance and must align with the security baseline controls and privacy-by-design checks.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Security controls baseline: {{xref:SEC-03}} | OPTIONAL
- Privacy checklist: {{xref:PRIV-07}} | OPTIONAL
- Audit integrity model: {{xref:AUDIT-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Control registry (control | spec         | No              |
| control_id (stable identi | spec         | No              |
| Framework mapping (which  | spec         | No              |
| Requirement statement (wh | spec         | No              |
| Owner (team/role)         | spec         | No              |
| Evidence artifacts list ( | spec         | No              |
| Evidence cadence (how oft | spec         | No              |
| Test/verification method  | spec         | No              |
| Status (planned/in_place/ | spec         | No              |
| Exception process referen | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Automated evidence collec | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every control must have evidence and a cadence; no “TBD” without an exception record.
- Evidence must be storable and reviewable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Control Catalog (by framework: control ID, description)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, exceptions ref, automation notes,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If controls[].control_id is UNKNOWN → block Completeness Gate.
- If controls[].requirement is UNKNOWN → block Completeness Gate.
- If controls[].evidence_artifacts is UNKNOWN → block Completeness Gate.
- If controls[].evidence_cadence is UNKNOWN → block Completeness Gate.
- If controls[*].verification_method is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] control_registry_defined == true
- [ ] evidence_and_cadence_defined == true
- [ ] verification_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-03
