# COMP-01 — Compliance Framework Inventory (SOC2, ISO, HIPAA, PCI)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-01                                          |
| Template Type     | Security / Compliance                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring compliance framework inve |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-01, PRIV-01, PRD-01                          |
| Produces          | Filled Compliance Framework Inventory (SOC2, ISO,|

## 2. Purpose

Define the canonical compliance scope: which frameworks/regulations apply, what is in-scope and out-of-scope, and what parts of the system are covered. This document anchors the compliance series and must not claim compliance certifications unless explicitly provided.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security overview: {{xref:SEC-01}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Product overview: {{xref:PRD-01}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Frameworks/regulations li | spec         | No              |
| In-scope systems/surfaces | spec         | No              |
| Out-of-scope statement (e | spec         | No              |
| Assumptions (what must be | spec         | No              |
| Compliance ownership (who | spec         | No              |
| Review cadence (when upda | spec         | No              |
| Evidence storage location | spec         | No              |
| References to downstream  | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Target certification goal | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Do not claim compliance status or certification unless provided by inputs.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Compliance Framework Inventory (SOC2, ISO, HIPAA, PCI)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SEC-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:COMP-02}}, {{xref:COMP-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, certification goals, open_questions
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If scope.frameworks is UNKNOWN → block Completeness Gate.
- If scope.in is UNKNOWN → block Completeness Gate.
- If gov.owner is UNKNOWN → block Completeness Gate.
- If evidence.location is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.COMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] frameworks_and_scope_defined == true
- [ ] ownership_and_evidence_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] COMP-02
