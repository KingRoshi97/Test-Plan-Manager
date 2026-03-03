# TMA-05 — Mitigation Plan (controls per threat, owner, status)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-05                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mitigation plan (controls |
| Filled By         | Internal Agent                                   |
| Consumes          | TMA-04, SEC-03, COMP-02                          |
| Produces          | Filled Mitigation Plan (controls per threat, owne|

## 2. Purpose

Create the canonical mapping from threats/abuse/risk items to implemented controls, owners, and evidence. This is the bridge between threat modeling, security requirements, and compliance control matrices.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Abuse catalog: {{xref:TMA-02}} | OPTIONAL
- Risk register: {{xref:TMA-04}} | OPTIONAL
- Security controls baseline: {{xref:SEC-03}} | OPTIONAL
- Compliance control matrix: {{xref:COMP-02}} | OPTIONAL
- Enforcement actions matrix: {{xref:RLIM-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Mapping registry (map_id  | spec         | No              |
| map_id (stable identifier | spec         | No              |
| risk_id or abuse_id bindi | spec         | No              |
| control_id binding (SEC-0 | spec         | No              |
| owner (team/role)         | spec         | No              |
| Implementation reference  | spec         | No              |
| Verification proof refere | spec         | No              |
| Status (planned/in_progre | spec         | No              |
| Residual risk note (after | spec         | No              |
| Telemetry reference (moni | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Compensating controls (if | spec         | Enrichment only, no new truth  |
| Compliance control linkag | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every mapping must include implementation and verification proof references (or approved
- UNKNOWN).
- Controls must be real and traceable to SEC-03.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Mitigation Plan (controls per threat, owner, status)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:TMA-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SEC-06}}, {{xref:COMP-09}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, done count, risk/abuse id (one must be
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If maps[].map_id is UNKNOWN → block Completeness Gate.
- If maps[].control_id is UNKNOWN → block Completeness Gate.
- If maps[].implementation_ref is UNKNOWN → block Completeness Gate.
- If maps[].verification_proof_ref is UNKNOWN → block Completeness Gate.
- If maps[*].telemetry_ref is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] mapping_registry_defined == true
- [ ] control_bindings_valid == true
- [ ] implementation_and_proof_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-06
