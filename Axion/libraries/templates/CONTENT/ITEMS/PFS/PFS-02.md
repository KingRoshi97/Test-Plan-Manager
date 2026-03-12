# PFS-02 — Pagination Rules (cursor/offset, stability guarantees)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-02                                             |
| Template Type     | Build / Pagination & Filtering                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring pagination rules (cursor/offset, stability guarantees)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Pagination Rules (cursor/offset, stability guarantees) Document                         |

## 2. Purpose

Define the canonical pagination rules for list endpoints, including cursor vs offset, parameter
names, stability guarantees, tie-break rules, max limits, and error mapping. This template must
be consistent with the query contract and endpoint specs and must not invent pagination modes
not present in upstream inputs.

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

Pagination mode (cursor/offset/UNKNOWN)
Parameter names (cursor/page/limit)
Cursor format rules (opaque vs structured)
Stability guarantees (consistent ordering across pages)
Default ordering requirement (bind to PFS-03)
Tie-break rule (required for stable ordering)
Max limit policy (max page size)
Backward/forward navigation behavior (next/prev)
Empty page behavior
Validation rules (bad cursor, bad page, bad limit)
Error mapping (bind to API-03 and PFS-04)

Optional Fields
Total count policy (whether total is returned) | OPTIONAL
Snapshot pagination (consistent snapshot) | OPTIONAL
Time-based pagination notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Pagination MUST be stable given the ordering defined in PFS-03 (or explicit per-endpoint
override).
Cursor MUST be treated as opaque by clients unless explicitly defined otherwise.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Validation failures MUST map to {{xref:API-03}}.
Output Format
1. Pagination Mode
mode: {{pagination.mode}} (cursor/offset/UNKNOWN)
notes: {{pagination.notes}} | OPTIONAL
2. Parameters
limit_param: {{pagination.params.limit}}
cursor_param: {{pagination.params.cursor}} | OPTIONAL
page_param: {{pagination.params.page}} | OPTIONAL
direction_param: {{pagination.params.direction}} | OPTIONAL
3. Cursor Rules (if cursor mode)
cursor_opaque: {{cursor.opaque}}
cursor_encoding: {{cursor.encoding}} | OPTIONAL
cursor_fields_included: {{cursor.fields_included}} | OPTIONAL
cursor_expiry: {{cursor.expiry}} | OPTIONAL
4. Offset Rules (if offset mode)
page_base: {{offset.page_base}} | OPTIONAL
offset_param: {{offset.offset_param}} | OPTIONAL
page_param: {{offset.page_param}} | OPTIONAL
5. Stability Guarantees
stability_statement: {{stability.statement}}
ordering_ref: {{stability.ordering_ref}} (expected: {{xref:PFS-03}})
tie_break_rule: {{stability.tie_break_rule}}
mutation_handling: {{stability.mutation_handling}} | OPTIONAL
6. Navigation Behavior
next_page_rule: {{nav.next_page_rule}}
prev_page_supported: {{nav.prev_supported}} | OPTIONAL
prev_page_rule: {{nav.prev_page_rule}} | OPTIONAL
7. Limits & Defaults
default_limit: {{limits.default_limit}}

max_limit: {{limits.max_limit}}
default_sort: {{limits.default_sort}} | OPTIONAL
8. Response Fields
items_field: {{response.items_field}}
next_cursor_field: {{response.next_cursor_field}} | OPTIONAL
prev_cursor_field: {{response.prev_cursor_field}} | OPTIONAL
has_more_field: {{response.has_more_field}} | OPTIONAL
total_count_field: {{response.total_count_field}} | OPTIONAL
9. Validation & Error Mapping
invalid_cursor_behavior: {{validation.invalid_cursor_behavior}}
invalid_page_behavior: {{validation.invalid_page_behavior}} | OPTIONAL
invalid_limit_behavior: {{validation.invalid_limit_behavior}}
error_code: {{validation.error_code}} (bind to {{xref:PFS-04}} / {{xref:API-03}})
status_code: {{validation.status_code}} (expected: 400)
10.References
Query contract: {{xref:PFS-01}}
Default ordering: {{xref:PFS-03}} | OPTIONAL
Validation/error mapping: {{xref:PFS-04}} | OPTIONAL
Performance constraints: {{xref:PFS-05}} | OPTIONAL
API error policy: {{xref:API-03}} | OPTIONAL
Cross-References
Upstream: {{xref:PFS-01}}, {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}}
| OPTIONAL
Downstream: {{xref:PFS-03}}, {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for cursor specifics if not defined; do not invent modes.
intermediate: Required. Define stability guarantees and tie-break rule.
advanced: Required. Add response field contract and total-count/snapshot policy if supported.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, pagination.notes, direction_param,
cursor_encoding, cursor_fields_included, cursor_expiry, offset rules, mutation_handling, prev
page rules, total_count_field, snapshot pagination, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If pagination.mode is UNKNOWN → block Completeness Gate.
If stability.tie_break_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PFS
Pass conditions:

required_fields_present == true
pagination_mode_defined == true
stability_guarantees_defined == true
tie_break_rule_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
○

PFS-03

PFS-03 — Default Ordering & Tie-Break Rules
Header Block

## 5. Optional Fields

Total count policy (whether total is returned) | OPTIONAL
Snapshot pagination (consistent snapshot) | OPTIONAL
Time-based pagination notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Pagination MUST be stable given the ordering defined in PFS-03 (or explicit per-endpoint**
- **override).**
- **Cursor MUST be treated as opaque by clients unless explicitly defined otherwise.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Validation failures MUST map to {{xref:API-03}}.**

## 7. Output Format

### Required Headings (in order)

1. `## Pagination Mode`
2. `## Parameters`
3. `## Cursor Rules (if cursor mode)`
4. `## Offset Rules (if offset mode)`
5. `## Stability Guarantees`
6. `## Navigation Behavior`
7. `## Limits & Defaults`
8. `## Response Fields`
9. `## Validation & Error Mapping`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:PFS-01}}, {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}}**
- | OPTIONAL
- **Downstream: {{xref:PFS-03}}, {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
