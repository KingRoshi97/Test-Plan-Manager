# PFS-01 — Query Contract (filter/sort operators, syntax)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-01                                             |
| Template Type     | Build / Pagination & Filtering                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring query contract (filter/sort operators, syntax)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Query Contract (filter/sort operators, syntax) Document                         |

## 2. Purpose

Define the canonical query contract for API list/search endpoints: filter syntax, sort syntax,
operator set, validation rules, reserved keywords, and how query errors map to API error policy.
This template must be consistent with endpoint specs and must not invent query capabilities not
present in upstream inputs.

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

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Filter grammar (syntax... | spec         | Yes             |
| Operator typing rules ... | spec         | Yes             |
| Sort grammar (single/m... | spec         | Yes             |
| Field allowlist model ... | spec         | Yes             |
| Reserved keywords and ... | spec         | Yes             |
| Default behaviors (def... | spec         | Yes             |
| Validation rules (bad ... | spec         | Yes             |
| Error mapping for inva... | spec         | Yes             |

## 5. Optional Fields

Full-text search parameter contract | OPTIONAL

Nested field query support | OPTIONAL
Join/include expansion rules | OPTIONAL
Query complexity limits | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- **PFS-04 Validation & Error Mapping (bad query → reason codes)**
- **PFS-05 Performance Constraints (limits, indexed fields policy)**
- **PFS-01**
- **PFS-01 — Query Contract (filter/sort operators, syntax)**
- **Header Block**
- **template_id: PFS-01**
- **title: Query Contract (filter/sort operators, syntax)**
- **type: api_query_contract**
- **template_version: 1.0.0**
- **output_path: 10_app/api_query/PFS-01_Query_Contract.md**
- **compliance_gate_id: TMP-05.PRIMARY.PFS**
- **upstream_dependencies: ["API-01", "API-02", "API-03"]**
- **inputs_required: ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX",**
- **"API-01", "API-02", "API-03"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Define the canonical query contract for API list/search endpoints: filter syntax, sort syntax,**
- **operator set, validation rules, reserved keywords, and how query errors map to API error policy.**
- **This template must be consistent with endpoint specs and must not invent query capabilities not**
- **present in upstream inputs.**
- **Inputs Required**
- **SPEC_INDEX: {{spec.index}}**
- **DOMAIN_MAP: {{domain.map}} | OPTIONAL**
- **GLOSSARY: {{glossary.terms}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **API-01 Endpoint Catalog: {{api.endpoint_catalog}}**
- **API-02 Endpoint Specs: {{api.endpoint_specs}}**
- **API-03 Error & Status Code Policy: {{api.error_policy}}**
- **Existing docs/notes: {{inputs.notes}} | OPTIONAL**
- **Required Fields**
- **Supported query parameters (filter, sort, page, cursor, limit, include, fields, etc.)**
- **Filter grammar (syntax definition)**
- **Supported filter operators (eq, ne, lt, lte, gt, gte, in, contains, prefix, exists, etc.)**
- **Operator typing rules (numeric/date/string/boolean)**
- **Sort grammar (single/multi-field, direction)**
- **Field allowlist model (what fields are filterable/sortable)**
- **Reserved keywords and escaping rules**
- **Default behaviors (default sort, default limit)**
- **Validation rules (bad operator, bad field, bad value)**
- **Error mapping for invalid queries (bind to API-03)**
- **Security constraints (prevent injection, prevent unbounded queries)**
- **Optional Fields**
- **Full-text search parameter contract | OPTIONAL**
- **Nested field query support | OPTIONAL**
- **Join/include expansion rules | OPTIONAL**
- **Query complexity limits | OPTIONAL**
- **Open questions | OPTIONAL**
- **Rules**
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Field allowlist MUST be explicit; do not allow arbitrary field names unless explicitly supported.**
- **Validation failures MUST map to {{xref:API-03}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Query contract MUST be applied consistently across all list endpoints (or deviations must be**
- **explicitly documented).**

## 7. Output Format

### Required Headings (in order)

1. `## Parameters (Top-Level)`
2. `## Filter Grammar`
3. `## examples:`
4. `## Filter Operators`
5. `## operators:`
6. `## Operator typing rules:`
7. `## Sort Grammar`
8. `## examples:`
9. `## Field Allowlist Model`
10. `## allowlist / UNKNOWN)`

## 8. Cross-References

- **Upstream: {{xref:API-01}}, {{xref:API-02}}, {{xref:API-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PFS-02}}, {{xref:PFS-03}}, {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL**
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
