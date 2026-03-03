# PAY-01 — Payment Provider Inventory (gateways, methods, regions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-01                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payment provider inventor |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, PRD-06                                   |
| Produces          | Filled Payment Provider Inventory (gateways, meth|

## 2. Purpose

Create the single, canonical inventory of payment providers used by the application, indexed by provider_id, including enabled environments, supported payment modes, and compliance scope notes. This document must not invent provider_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- PRD-06 NFRs/Compliance: {{prd.nfrs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Provider registry (provid | spec         | No              |
| provider_id (stable ident | spec         | No              |
| provider name/vendor      | spec         | No              |
| integration_id binding (I | spec         | No              |
| supported modes (one-time | spec         | No              |
| supported payment methods | spec         | No              |
| environments enabled (dev | spec         | No              |
| webhook support (yes/no)  | spec         | No              |
| criticality (low/med/high | spec         | No              |
| owner (team/role)         | spec         | No              |
| compliance scope notes (P | spec         | No              |
| references to detailed sp | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Status (planned/active/de | spec         | Enrichment only, no new truth  |
| SLA/uptime notes          | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent provider_ids; use only {{spec.pay_providers_by_id}} if present, else mark
- UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Payment Provider Inventory (gateways, methods, regions)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-02}}, {{xref:PAY-04}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, secondary spec refs, status,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If providers[].provider_id is UNKNOWN → block Completeness Gate.
- If providers[].integration_id is UNKNOWN → block Completeness Gate.
- If providers[].modes is UNKNOWN → block Completeness Gate.
- If providers[].pci_scope_notes is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] provider_ids_unique == true
- [ ] integration_ids_exist_in_IXS_01 == true
- [ ] pci_scope_noted == true
- [ ] spec_refs_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-02
