# PFS-01 — Query Contract

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-01                                           |
| Template Type     | Build / Pagination                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring query contract            |
| Filled By         | Internal Agent                                   |
| Consumes          | API-01, API-02, API-03                           |
| Produces          | Filled Query Contract                            |

## 2. Purpose

Define the canonical query contract for API list/search endpoints: filter syntax, sort syntax, operator set, validation rules, reserved keywords, and how query errors map to API error policy. This template must be consistent with endpoint specs and must not invent query capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-03 Error & Status Code Policy: {{api.error_policy}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Supported query parameters (filter, sort, page, cursor, limit, include, fields, etc.) | spec | No |
| Filter grammar (syntax definition) | spec | No |
| Supported filter operators (eq, ne, lt, lte, gt, gte, in, contains, prefix, exists, etc.) | spec | No |
| Operator typing rules (numeric/date/string/boolean) | spec | No |
| Sort grammar (single/multi-field, direction) | spec | No |
| Field allowlist model (what fields are filterable/sortable) | spec | No |
| Reserved keywords and escaping rules | spec | No |
| Default behaviors (default sort, default limit) | spec | No |
| Validation rules (bad operator, bad field, bad value) | spec | No |
| Error mapping for invalid queries (bind to API-03) | spec | No |
| Security constraints (prevent injection, prevent unbounded queries) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Full-text search parameter contract | spec | OPTIONAL |
| Nested field query support | spec | OPTIONAL |
| Join/include expansion rules | spec | OPTIONAL |
| Query complexity limits | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Field allowlist MUST be explicit; do not allow arbitrary field names unless explicitly supported.
- Validation failures MUST map to {{xref:API-03}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Query contract MUST be applied consistently across all list endpoints (or deviations must be explicitly documented).

## 7. Cross-References

- **Upstream**: {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PFS-02}}, {{xref:PFS-03}}, {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN for grammar specifics if not provided; do not invent capabilities. | Required. Define operators, sort syntax, defaults, and validation mapping. | Required. Add explicit allowlist model and security/complexity limits. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, include/fields/search params, nested field support, query complexity limits, operator optional set, sort multi support, escape rules, max_* limits, error_details_format, pii filtering restrictions, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If filter.grammar is UNKNOWN → block Completeness Gate.
- If validation.error_code is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.PFS
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] filter_grammar_defined == true
  - [ ] operator_set_defined == true
  - [ ] validation_mapping_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

