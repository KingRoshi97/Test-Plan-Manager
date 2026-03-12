# PFS-05 — Performance Constraints (limits, indexed fields policy)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PFS-05                                             |
| Template Type     | Build / Pagination & Filtering                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring performance constraints (limits, indexed fields policy)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Performance Constraints (limits, indexed fields policy) Document                         |

## 2. Purpose

Define the canonical performance constraints for queryable endpoints, including max page
sizes, query complexity limits, indexed fields policy for filters/sorts, and safeguards against
expensive scans. This template must be consistent with query/pagination contracts and must
not invent datastore/index capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PFS-01 Query Contract: {{pfs.query_contract}}
- PFS-02 Pagination Rules: {{pfs.pagination_rules}}
- PFS-03 Default Ordering Rules: {{pfs.ordering_rules}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Max limit policy (hard... | spec         | Yes             |
| Full-scan prevention r... | spec         | Yes             |
| Timeout policy (query ... | spec         | Yes             |
| Safe defaults (default... | spec         | Yes             |
| Caching policy (if any)   | spec         | Yes             |
| Per-endpoint performan... | spec         | Yes             |

## 5. Optional Fields

Search engine integration notes | OPTIONAL
Adaptive query throttling | OPTIONAL

Warm cache vs cold cache notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Fields MUST NOT be marked filterable/sortable unless they comply with indexed fields policy**
- **(or explicit override).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Performance failures SHOULD map to API-03 as dependency/internal per policy (or validation if**
- **rejected up-front).**

## 7. Output Format

### Required Headings (in order)

1. `## Performance Budget`
2. `## Hard Limits`
3. `## Complexity Constraints`
4. `## Indexed Fields Policy`
5. `## Full-Scan Prevention`
6. `## Timeout Policy`
7. `## Caching Policy`
8. `## Per-Endpoint Overrides Model`
9. `## Observability Requirements`
10. `## metrics:`

## 8. Cross-References

- **Upstream: {{xref:PFS-01}}, {{xref:PFS-02}}, {{xref:PFS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:API-02}} | OPTIONAL, {{xref:OPS-OBS}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

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
