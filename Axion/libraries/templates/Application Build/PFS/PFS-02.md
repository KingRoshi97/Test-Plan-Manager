# PFS-02 — Pagination Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-02                                           |
| Template Type     | Build / Pagination                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring pagination rules          |
| Filled By         | Internal Agent                                   |
| Consumes          | PFS-01, API-01, API-02, API-03                   |
| Produces          | Filled Pagination Rules                          |

## 2. Purpose

Define the canonical pagination rules for list endpoints, including cursor vs offset, parameter names, stability guarantees, tie-break rules, max limits, and error mapping. This template must be consistent with the query contract and endpoint specs and must not invent pagination modes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PFS-01 Query Contract: {{pfs.query_contract}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Pagination mode (cursor/offset/UNKNOWN) | spec | Yes |
| Parameter names (cursor/page/limit) | spec | No |
| Cursor format rules (opaque vs structured) | spec | No |
| Stability guarantees (consistent ordering across pages) | spec | No |
| Default ordering requirement (bind to PFS-03) | spec | No |
| Tie-break rule (required for stable ordering) | spec | No |
| Max limit policy (max page size) | spec | No |
| Backward/forward navigation behavior (next/prev) | spec | No |
| Empty page behavior | spec | No |
| Validation rules (bad cursor, bad page, bad limit) | spec | No |
| Error mapping (bind to API-03 and PFS-04) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Total count policy (whether total is returned) | spec | OPTIONAL |
| Snapshot pagination (consistent snapshot) | spec | OPTIONAL |
| Time-based pagination notes | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Pagination MUST be stable given the ordering defined in PFS-03 (or explicit per-endpoint override).
- Cursor MUST be treated as opaque by clients unless explicitly defined otherwise.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Validation failures MUST map to {{xref:API-03}}.

## 7. Cross-References

- **Upstream**: {{xref:PFS-01}}, {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PFS-03}}, {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN for cursor specifics if not defined; do not invent modes. | Required. Define stability guarantees and tie-break rule. | Required. Add response field contract and total-count/snapshot policy if supported. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, pagination.notes, direction_param, cursor_encoding, cursor_fields_included, cursor_expiry, offset rules, mutation_handling, prev page rules, total_count_field, snapshot pagination, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If pagination.mode is UNKNOWN → block Completeness Gate.
- If stability.tie_break_rule is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PFS
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] pagination_mode_defined == true
  - [ ] stability_guarantees_defined == true
  - [ ] tie_break_rule_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

