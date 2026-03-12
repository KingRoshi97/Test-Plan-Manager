# IXS-02 — Integration Spec (per integration: purpose, data flow, auth)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-02                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring integration spec (per integration: purpose, data flow, auth)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Integration Spec (per integration: purpose, data flow, auth) Document                         |

## 2. Purpose

Define the canonical per-integration specification: what the integration does, how data moves,
the exact interfaces (APIs/webhooks/files), authentication method, and operational behavior.
This template must not invent endpoints, entities, or integration IDs beyond what exists in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| integration_id (must e... | spec         | Yes             |
| integration name/vendor   | spec         | Yes             |
| purpose statement         | spec         | Yes             |
| direction (inbound/out... | spec         | Yes             |
| interfaces used (REST/... | spec         | Yes             |
| data objects exchanged... | spec         | Yes             |
| auth method (oauth/api... | spec         | Yes             |
| credential location po... | spec         | Yes             |
| rate limit/quotas summ... | spec         | Yes             |
| error handling policy ... | spec         | Yes             |
| observability requirem... | spec         | Yes             |
| security/compliance no... | spec         | Yes             |

## 5. Optional Fields

SLAs/latency expectations | OPTIONAL
Batch vs realtime notes | OPTIONAL
Data retention constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **integration_id MUST exist in {{xref:IXS-01}}.**
- Do not introduce new endpoint_ids or schema_refs; reference existing IDs from
- **{{xref:API-01}}/{{xref:DATA-06}}.**
- **Auth must be specific and implementable; do not leave “secure” as a description.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Integration Identity`
2. `## Purpose`
3. `## Interfaces`
4. `## Data Objects & Mapping`
5. `## Data Flow`
6. `## flow:`
7. `## Auth & Credentials`
8. `## OPTIONAL`
9. `## Rate Limits / Quotas`
10. `## Error Handling`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}}, {{xref:API-01}} | OPTIONAL, {{xref:DATA-06}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IXS-09}}, {{xref:IXS-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
