# SIC-02 — Contract Spec (per interface:

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIC-02                                             |
| Template Type     | Architecture / Interfaces                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring contract spec (per interface:    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Contract Spec (per interface: Document                         |

## 2. Purpose

Define the detailed, enforceable contract for each external interface: authentication,
request/response shapes, events, validation rules, error mapping, rate limits, and operational
expectations. This is the authoritative specification used to implement and validate integrations.

## 3. Inputs Required

- ● SIC-01: {{xref:SIC-01}}
- ● ARC-07: {{xref:ARC-07}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● APIG-02: {{xref:APIG-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| One contract block per... | spec         | Yes             |
| Per contract:             | spec         | Yes             |
| ○ interface_id + exter... | spec         | Yes             |
| ○ direction               | spec         | Yes             |
| ○ auth method details ... | spec         | Yes             |
| ○ endpoints/events cov... | spec         | Yes             |
| ○ request schema(s)       | spec         | Yes             |
| ○ response schema(s)      | spec         | Yes             |
| ○ validation rules (sc... | spec         | Yes             |
| ○ idempotency expectat... | spec         | Yes             |
| ○ pagination/filtering... | spec         | Yes             |
| ○ error handling:         | spec         | Yes             |

## 5. Optional Fields

● Example payloads | OPTIONAL
● Sandbox/dev environment notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Contracts must not include secrets; reference where they are stored/rotated.
- Any inbound contract must define signature/integrity and replay protection if applicable.
- All error handling must map to the system error model (ERR).
- Validation must include both schema and semantic checks (where needed).
- Versioning policy must be explicit; if vendor changes, define update cadence.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Overview`
2. `## 2) Authentication`
3. `## 3) Endpoints / Events Covered`
4. `## kind`
5. `## (endpoint/even`
6. `## name`
7. `## direction`
8. `## notes`
9. `## ems[0].id}}`
10. `## ms[0].kind}}`

## 8. Cross-References

- Upstream: {{xref:SIC-01}}, {{xref:ARC-07}} | OPTION

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
