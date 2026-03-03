# TMA-03 — Threat Catalog (STRIDE/DREAD per component)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-03                                           |
| Template Type     | Security / Threat Modeling                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring threat catalog (stride/dr |
| Filled By         | Internal Agent                                   |
| Consumes          | API-01, WHCP-01, FMS-02, ROUTE-01                |
| Produces          | Filled Threat Catalog (STRIDE/DREAD per component|

## 2. Purpose

Create the canonical inventory of externally reachable and high-risk internal surfaces that can be attacked: API endpoints, web/mobile clients, webhooks, file upload surfaces, and third-party integration entry points. This template is used to drive threat modeling coverage and monitoring.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API endpoint catalog: {{xref:API-01}} | OPTIONAL
- Webhook catalog: {{xref:WHCP-01}} | OPTIONAL
- Upload/download spec: {{xref:FMS-02}} | OPTIONAL
- Route contract: {{xref:ROUTE-01}} | OPTIONAL
- Mobile navigation map: {{xref:MOB-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Surface registry (surface | spec         | No              |
| surface_id (stable identi | spec         | No              |
| surface type (api/web/mob | spec         | No              |
| Identifier (endpoint_id/p | spec         | No              |
| Auth requirement (public/ | spec         | No              |
| Primary risk class (low/m | spec         | No              |
| Data classes exposed (PII | spec         | No              |
| Rate limit applicability  | spec         | No              |
| Logging/monitoring expect | spec         | No              |
| Owner (team/service)      | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Deprecation status        | spec         | Enrichment only, no new truth  |
| Known mitigations summary | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Every surface must declare auth requirement and risk class.
- Do not invent endpoint IDs/routes/webhook IDs; reference upstream inventories when available.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Threat Catalog (STRIDE/DREAD per component)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:API-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:TMA-04}}, {{xref:SEC-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, rate limit ref, monitoring ref, status,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If surfaces[].surface_id is UNKNOWN → block Completeness Gate.
- If surfaces[].auth_requirement is UNKNOWN → block Completeness Gate.
- If surfaces[].risk_class is UNKNOWN → block Completeness Gate.
- If surfaces[].owner is UNKNOWN → block Completeness Gate.
- If surfaces[*].data_classes is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.TMA
- Pass conditions:
- [ ] required_fields_present == true
- [ ] surface_registry_defined == true
- [ ] each_surface_has_auth_and_risk == true
- [ ] data_classes_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] TMA-04
