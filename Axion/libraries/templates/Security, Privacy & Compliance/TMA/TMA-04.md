# TMA-04 — Risk Assessment Matrix (likelihood × impact)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-04                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring risk assessment matrix (l |
| Filled By         | Internal Agent                                   |
| Consumes          | TMA-02, TMA-03, SEC-03                           |
| Produces          | Filled Risk Assessment Matrix (likelihood × impac|

## 2. Purpose

Define the canonical risk register for threats and abuse: each risk item, what it impacts, likelihood/impact ratings, existing mitigations, gaps, owners, and tracking status. This template must align with abuse cases and security baseline controls and should be used to drive remediation work.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Threat model scope/method: {{xref:TMA-01}} | OPTIONAL
- Abuse case catalog: {{xref:TMA-02}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Security baseline controls: {{xref:SEC-03}} | OPTIONAL
- Risk assessment process: {{xref:COMP-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Risk registry (risk_id li | spec         | No              |
| risk_id (stable identifie | spec         | No              |
| Title/description         | spec         | No              |
| Linked abuse_id or threat | spec         | No              |
| Impacted surfaces (surfac | spec         | No              |
| Impacted assets (asset_id | spec         | No              |
| Likelihood rating (low/me | spec         | No              |
| Impact rating (low/med/hi | spec         | No              |
| Overall risk rating (deri | spec         | No              |
| Existing mitigations (con | spec         | No              |
| Gaps/needed mitigations   | spec         | No              |
| Owner                     | spec         | No              |
| Status (open/mitigating/a | spec         | No              |
| Review date/cadence       | spec         | No              |
| Telemetry requirement (ho | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Due date                  | spec         | Enrichment only, no new truth  |
| Risk acceptance record (i | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Each risk must link to at least one mitigation or explicitly state NONE + gap.
- Risk acceptance must follow SEC-08/COMP-08 (time-bound, approved).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Risk Assessment Matrix (likelihood × impact)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-05}}, {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, linked abuse id, overall rating, due date,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If risks[].risk_id is UNKNOWN → block Completeness Gate.
- If risks[].surfaces is UNKNOWN → block Completeness Gate.
- If risks[].likelihood is UNKNOWN → block Completeness Gate.
- If risks[].impact is UNKNOWN → block Completeness Gate.
- If risks[*].mitigations is UNKNOWN → block Completeness Gate (unless explicitly NONE + gaps

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] risk_registry_defined == true
- [ ] each_risk_has_mitigations_or_gaps == true
- [ ] owners_and_status_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-05
