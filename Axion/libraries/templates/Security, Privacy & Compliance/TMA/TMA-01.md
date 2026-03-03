# TMA-01 — Threat Model Inventory (by surface/component)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-01                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring threat model inventory (b |
| Filled By         | Internal Agent                                   |
| Consumes          | SEC-02, SPEC_INDEX                               |
| Produces          | Filled Threat Model Inventory (by surface/compone|

## 2. Purpose

Define the canonical scope and method for threat modeling: what assets and surfaces are included, attacker personas, and the analysis method (e.g., STRIDE), plus required outputs (abuse cases, risk register). This template anchors the TMA series and must align with security architecture.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Scope statement (what is  | spec         | No              |
| Out-of-scope statement (e | spec         | No              |
| Assets list (asset_id lis | spec         | No              |
| Actor list (actor_id list | spec         | No              |
| Threat modeling method (S | spec         | No              |
| Diagram inventory require | spec         | No              |
| Required outputs list (TM | spec         | No              |
| Review cadence (when upda | spec         | No              |
| Ownership (who maintains  | spec         | No              |
| Telemetry/evidence pointe | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Assumed constraints (time | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not invent assets/actors; if missing, mark UNKNOWN and flag.
- Method must be explicit and consistently applied.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Threat Model Inventory (by surface/component)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SEC-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-02}}, {{xref:TMA-04}}, {{xref:TMA-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, data classes/notes, capabilities, method
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If scope.in is UNKNOWN → block Completeness Gate.
- If assets list is UNKNOWN → block Completeness Gate.
- If actors list is UNKNOWN → block Completeness Gate.
- If method.name is UNKNOWN → block Completeness Gate.
- If gov.owner is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] scope_assets_actors_defined == true
- [ ] method_defined == true
- [ ] governance_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-02
