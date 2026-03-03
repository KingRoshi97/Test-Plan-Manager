# CRMERP-01 — Integration Inventory (CRM/ERP systems + endpoints)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-01                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration inventory (cr |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02                                   |
| Produces          | Filled Integration Inventory (CRM/ERP systems + e|

## 2. Purpose

Create the single, canonical inventory of all CRM/ERP systems integrated with the application, indexed by system_id, including which objects/entities are synced, directionality, environments, and ownership. This document must not invent system_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- IXS-02 Integration Specs: {{ixs.integration_specs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| System registry (system_i | spec         | No              |
| system_id (stable identif | spec         | No              |
| system name/vendor (e.g., | spec         | No              |
| system type (CRM/ERP/UNKN | spec         | No              |
| integration_id binding (f | spec         | No              |
| sync direction (push/pull | spec         | No              |
| objects/entities covered  | spec         | No              |
| primary keys (external id | spec         | No              |
| environments enabled (dev | spec         | No              |
| criticality (low/med/high | spec         | No              |
| owner (team/role)         | spec         | No              |
| data classes involved (PI | spec         | No              |
| references to detailed sp | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Status (planned/active/de | spec         | Enrichment only, no new truth  |
| SLA/uptime notes          | spec         | Enrichment only, no new truth  |
| Cost/billing owner        | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new system_ids; use only {{spec.crmerp_systems_by_id}} if present, else
- mark UNKNOWN and flag.
- system_id MUST bind to an integration_id in {{xref:IXS-01}} (or be flagged UNKNOWN with
- reason).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Integration Inventory (CRM/ERP systems + endpoints)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IXS-01}} | OPTIONAL, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:CRMERP-02}}, {{xref:CRMERP-03}}, {{xref:CRMERP-04}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, vendor, inv notes, status, sla_notes,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If systems[].system_id is UNKNOWN → block Completeness Gate.
- If systems[].integration_id is UNKNOWN → block Completeness Gate.
- If systems[].sync_direction is UNKNOWN → block Completeness Gate.
- If systems[].spec_refs is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] system_ids_unique == true
- [ ] integration_ids_exist_in_IXS_01 == true
- [ ] objects_covered_defined == true
- [ ] spec_refs_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-02
