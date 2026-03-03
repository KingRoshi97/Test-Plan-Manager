# PFS-03 — Default Ordering & Tie-Break Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-03                                           |
| Template Type     | Build / Pagination                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring default ordering & tie-br |
| Filled By         | Internal Agent                                   |
| Consumes          | PFS-01, PFS-02, API-01, API-02                   |
| Produces          | Filled Default Ordering & Tie-Break Rules        |

## 2. Purpose

Define the canonical default ordering rules for list endpoints, including the required tie-break rule to guarantee stable pagination and deterministic results when multiple records share the same primary sort value. This template must be consistent with query and pagination contracts and must not invent ordering guarantees not supported by upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PFS-01 Query Contract: {{pfs.query_contract}}
- PFS-02 Pagination Rules: {{pfs.pagination_rules}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Default ordering policy s | spec         | No              |
| Primary ordering fields ( | spec         | No              |
| Direction defaults (asc/d | spec         | No              |
| Tie-break field (stable u | spec         | No              |
| Null ordering policy (nul | spec         | No              |
| Ordering allowlist (what  | spec         | No              |
| Override rules (when endp | spec         | No              |
| Consistency rules with cu | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-endpoint ordering ove | spec         | Enrichment only, no new truth  |
| Locale/collation rules    | spec         | Enrichment only, no new truth  |
| Case sensitivity rules    | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Tie-break field MUST be unique and stable (e.g., id).
- Ordering MUST be stable across pages as required by PFS-02.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- If ordering overrides exist, they MUST be explicit in API-02 per endpoint.

## 7. Output Format

### Required Headings (in order)

1. `## Default Ordering & Tie-Break Rules`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:API-01}}, {{xref:API-02}},
- {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, secondary_sort_fields, notes,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If any rules[*].tie_break_field is UNKNOWN → block Completeness Gate.
- If ordering.policy_statement is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PFS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] tie_break_defined_for_each_list_type == true
- [ ] ordering_consistent_with_pfs02 == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PFS-04
