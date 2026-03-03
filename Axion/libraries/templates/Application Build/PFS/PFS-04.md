# PFS-04 — Validation & Error Mapping (bad query → reason codes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-04                                           |
| Template Type     | Build / Pagination                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring validation & error mappin |
| Filled By         | Internal Agent                                   |
| Consumes          | PFS-01, PFS-02, API-03                           |
| Produces          | Filled Validation & Error Mapping (bad query → re|

## 2. Purpose

Define the canonical validation rules and error mapping for query, filtering, sorting, and pagination parameters, including stable reason codes and how errors are represented under the API error policy. This template must be consistent with PFS query/pagination contracts and must not invent error codes beyond what upstream inputs allow.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PFS-01 Query Contract: {{pfs.query_contract}}
- PFS-02 Pagination Rules: {{pfs.pagination_rules}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Validation scope (which p | spec         | No              |
| Reason code registry (rea | spec         | No              |
| Validation failure catego | spec         | No              |
| Error status mapping (exp | spec         | No              |
| Error code mapping (bind  | spec         | No              |
| Error details format for  | spec         | No              |
| Examples of common failur | spec         | No              |
| Security validation rules | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-endpoint overrides    | spec         | Enrichment only, no new truth  |
| Localization of messages  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Reason codes MUST be stable and MUST NOT be renamed once published.
- All query validation failures MUST map to API-03 error envelope/policy.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not invent new API error codes; reason codes are internal classification under the mapped
- API-03 error_code.

## 7. Output Format

### Required Headings (in order)

1. `## Validation & Error Mapping (bad query → reason codes)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PFS-05}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, applies_to_endpoints, details_fields,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If mapping.error_code is UNKNOWN → block Completeness Gate.
- If reason_code registry is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PFS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] reason_code_registry_defined == true
- [ ] error_mapping_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PFS-05
