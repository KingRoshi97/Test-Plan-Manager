# PFS-03 — Default Ordering & Tie-Break Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-03                                             |
| Template Type     | Build / Pagination & Filtering                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring default ordering & tie-break rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Default Ordering & Tie-Break Rules Document                         |

## 2. Purpose

Define the canonical default ordering rules for list endpoints, including the required tie-break rule
to guarantee stable pagination and deterministic results when multiple records share the same
primary sort value. This template must be consistent with query and pagination contracts and
must not invent ordering guarantees not supported by upstream inputs.

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
| Default ordering polic... | spec         | Yes             |
| Primary ordering field... | spec         | Yes             |
| Direction defaults (as... | spec         | Yes             |
| Tie-break field (stabl... | spec         | Yes             |
| Null ordering policy (... | spec         | Yes             |
| Ordering allowlist (wh... | spec         | Yes             |
| Override rules (when e... | spec         | Yes             |

## 5. Optional Fields

Per-endpoint ordering overrides | OPTIONAL
Locale/collation rules | OPTIONAL

Case sensitivity rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- **Header Block**
- **template_id: PFS-03**
- **title: Default Ordering & Tie-Break Rules**
- **type: api_default_ordering**
- **template_version: 1.0.0**
- **output_path: 10_app/api_query/PFS-03_Default_Ordering_Tie_Break_Rules.md**
- **compliance_gate_id: TMP-05.PRIMARY.PFS**
- **upstream_dependencies: ["PFS-01", "PFS-02", "API-01", "API-02"]**
- **inputs_required: ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX",**
- **"PFS-01", "PFS-02", "API-01", "API-02"]**
- **required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}**
- **Purpose**
- **Define the canonical default ordering rules for list endpoints, including the required tie-break rule**
- **to guarantee stable pagination and deterministic results when multiple records share the same**
- **primary sort value. This template must be consistent with query and pagination contracts and**
- **must not invent ordering guarantees not supported by upstream inputs.**
- **Inputs Required**
- **SPEC_INDEX: {{spec.index}}**
- **DOMAIN_MAP: {{domain.map}} | OPTIONAL**
- **GLOSSARY: {{glossary.terms}} | OPTIONAL**
- **STANDARDS_INDEX: {{standards.index}} | OPTIONAL**
- **PFS-01 Query Contract: {{pfs.query_contract}}**
- **PFS-02 Pagination Rules: {{pfs.pagination_rules}}**
- **API-01 Endpoint Catalog: {{api.endpoint_catalog}}**
- **API-02 Endpoint Specs: {{api.endpoint_specs}}**
- **Existing docs/notes: {{inputs.notes}} | OPTIONAL**
- **Required Fields**
- **Default ordering policy statement (system-wide)**
- **Primary ordering fields (per resource/list type)**
- **Direction defaults (asc/desc)**
- **Tie-break field (stable unique field)**
- **Null ordering policy (nulls first/last)**
- **Ordering allowlist (what can be sorted) binding to PFS-01**
- **Override rules (when endpoints can override defaults)**
- **Consistency rules with cursor pagination (cursor includes ordering fields)**
- **Optional Fields**
- **Per-endpoint ordering overrides | OPTIONAL**
- **Locale/collation rules | OPTIONAL**
- **Case sensitivity rules | OPTIONAL**
- **Open questions | OPTIONAL**
- **Rules**
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Tie-break field MUST be unique and stable (e.g., id).**
- **Ordering MUST be stable across pages as required by PFS-02.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- If ordering overrides exist, they MUST be explicit in API-02 per endpoint.

## 7. Output Format

### Required Headings (in order)

1. `## Global Default Ordering Policy`
2. `## Default Ordering By Resource/List Type`
3. `## Ordering Rule`
4. `## (Repeat the “Ordering Rule” block for each list type.)`
5. `## Sorting Allowlist Binding`
6. `## allowlist / global / UNKNOWN)`
7. `## Override Rules`
8. `## Cursor Consistency Rules`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:API-01}}, {{xref:API-02}},**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PFS-04}}, {{xref:PFS-05}} | OPTIONAL**
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
