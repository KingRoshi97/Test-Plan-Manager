# API-05 — Rate Limit & Abuse Controls

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-05                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring rate limit & abuse controls    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Rate Limit & Abuse Controls Document                         |

## 2. Purpose

Define how rate limiting and abuse controls apply to API endpoint classes: classification, limits,
enforcement points, error behaviors, exemptions, and observability. This is the API-specific
binding of the global RLIM policy.

## 3. Inputs Required

- ● RLIM-01: {{xref:RLIM-01}} | OPTIONAL
- ● RLIM-02: {{xref:RLIM-02}} | OPTIONAL
- ● API-01: {{xref:API-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● OBS-04: {{xref:OBS-04}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Endpoint classificatio... | spec         | Yes             |
| ○ public read             | spec         | Yes             |
| ○ authenticated read      | spec         | Yes             |
| ○ write/mutate            | spec         | Yes             |
| ○ auth endpoints          | spec         | Yes             |
| ○ admin endpoints         | spec         | Yes             |
| ○ file/media endpoints    | spec         | Yes             |
| Mapping: endpoint_id →... | spec         | Yes             |
| Limits per class:         | spec         | Yes             |
| ○ scope (ip/user/tenant)  | spec         | Yes             |
| ○ threshold (req/min)     | spec         | Yes             |
| ○ burst policy            | spec         | Yes             |

## 5. Optional Fields

● WAF/bot protection pointer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Rate limits must be enforceable server-side and consistent across endpoints of same
- **class.**
- 429 responses must conform to ERR-03 and include reason_code.
- Retry-After must be included where applicable.
- Admin endpoints require stricter default limits and auditing.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Endpoint Classes (required)`
2. `## class_id`
3. `## description`
4. `## default_scope`
5. `## default_limit`
6. `## burst_policy`
7. `## cls_publi`
8. `## c_read`
9. `## c.desc}}`
10. `## c.scope}}`

## 8. Cross-References

- Upstream: {{xref:RLIM-01}} | OPTIONAL, {{xref:API-01}} | OPTIONAL
- Downstream: {{xref:RLIM-06}} | OPTIONAL, {{xref:ALRT-*}} | OPTIONAL, {{xref:QA-04}}
- | OPTIONAL
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL,
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
