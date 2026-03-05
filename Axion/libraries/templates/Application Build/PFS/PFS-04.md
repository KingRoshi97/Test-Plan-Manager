# PFS-04 — Validation & Error Mapping (bad query → reason codes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-04                                             |
| Template Type     | Build / Pagination & Filtering                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring validation & error mapping (bad query → reason codes)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Validation & Error Mapping (bad query → reason codes) Document                         |

## 2. Purpose

Define the canonical validation rules and error mapping for query, filtering, sorting, and
pagination parameters, including stable reason codes and how errors are represented under the
API error policy. This template must be consistent with PFS query/pagination contracts and
must not invent error codes beyond what upstream inputs allow.

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
| Validation scope (whic... | spec         | Yes             |
| Reason code registry (... | spec         | Yes             |
| Error status mapping (... | spec         | Yes             |
| Error code mapping (bi... | spec         | Yes             |

## 5. Optional Fields

Per-endpoint overrides | OPTIONAL
Localization of messages | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Reason codes MUST be stable and MUST NOT be renamed once published.
All query validation failures MUST map to API-03 error envelope/policy.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Do not invent new API error codes; reason codes are internal classification under the mapped
API-03 error_code.
Output Format
1. Validation Scope
validated_params: {{validation.params}}
applies_to_endpoints: {{validation.applies_to}} | OPTIONAL
2. Reason Code Registry
Reason
reason_code: {{reasons[0].reason_code}}
name: {{reasons[0].name}}
category: {{reasons[0].category}}
trigger: {{reasons[0].trigger}}
details_fields: {{reasons[0].details_fields}} | OPTIONAL
message_template: {{reasons[0].message_template}} | OPTIONAL
(Repeat for each reason_code.)
3. Failure Categories
invalid_field: {{categories.invalid_field}}
invalid_operator: {{categories.invalid_operator}}
invalid_value: {{categories.invalid_value}}
invalid_sort: {{categories.invalid_sort}} | OPTIONAL
invalid_cursor: {{categories.invalid_cursor}} | OPTIONAL
invalid_limit: {{categories.invalid_limit}}
invalid_page: {{categories.invalid_page}} | OPTIONAL
query_too_complex: {{categories.query_too_complex}} | OPTIONAL
4. Error Mapping (API-03 Binding)
status_code: {{mapping.status_code}} (expected: 400)
error_code: {{mapping.error_code}} (bind to {{xref:API-03}})
error_category: {{mapping.error_category}} (expected: validation) | OPTIONAL
retryable: {{mapping.retryable}} (expected: false) | OPTIONAL
5. Error Details Format
details:
param: {{details.param}}
field: {{details.field}} | OPTIONAL
operator: {{details.operator}} | OPTIONAL
value: {{details.value}} | OPTIONAL

reason_code: {{details.reason_code}}
hint: {{details.hint}} | OPTIONAL
6. Security Validation Rules
injection_checks: {{security.injection_checks}}
complexity_limits: {{security.complexity_limits}} | OPTIONAL
allowlist_enforcement: {{security.allowlist_enforcement}}
reserved_token_handling: {{security.reserved_token_handling}} | OPTIONAL
7. Examples (Optional)
example_invalid_field: {{examples.invalid_field}} | OPTIONAL
example_invalid_operator: {{examples.invalid_operator}} | OPTIONAL
example_invalid_cursor: {{examples.invalid_cursor}} | OPTIONAL
8. References
Query contract: {{xref:PFS-01}}
Pagination rules: {{xref:PFS-02}}
Default ordering: {{xref:PFS-03}} | OPTIONAL
Performance constraints: {{xref:PFS-05}} | OPTIONAL
API error policy: {{xref:API-03}}
Cross-References
Upstream: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PFS-05}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for reason codes if not defined; do not invent new API
error codes.
intermediate: Required. Define reason registry and error details format.
advanced: Required. Add security/complexity validation and examples.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, applies_to_endpoints, details_fields,
message_template, invalid_sort, invalid_cursor, invalid_page, query_too_complex,
complexity_limits, reserved_token_handling, examples, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If mapping.error_code is UNKNOWN → block Completeness Gate.
If reason_code registry is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PFS
Pass conditions:
required_fields_present == true
reason_code_registry_defined == true

error_mapping_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PFS-05

PFS-05 — Performance Constraints (limits, indexed fields policy)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Reason codes MUST be stable and MUST NOT be renamed once published.**
- All query validation failures MUST map to API-03 error envelope/policy.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not invent new API error codes; reason codes are internal classification under the mapped
- **API-03 error_code.**

## 7. Output Format

### Required Headings (in order)

1. `## Validation Scope`
2. `## Reason Code Registry`
3. `## Reason`
4. `## (Repeat for each reason_code.)`
5. `## Failure Categories`
6. `## Error Mapping (API-03 Binding)`
7. `## Error Details Format`
8. `## details:`
9. `## Security Validation Rules`
10. `## Examples (Optional)`

## 8. Cross-References

- **Upstream: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PFS-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
