# ARC-07 — Integration Architecture

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ARC-07                                             |
| Template Type     | Architecture / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring integration architecture    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Integration Architecture Document                         |

## 2. Purpose

Define the system-level integration architecture: what external systems exist, what
boundaries/trust assumptions apply, what data crosses the boundary, and the rules for
authentication, integrity, retries, and auditing. This is the architecture-level view; per-integration
details live in SIC templates.

## 3. Inputs Required

- ● ARC-01: {{xref:ARC-01}} | OPTIONAL
- ● SIC-01: {{xref:SIC-01}} | OPTIONAL
- ● RISK-03: {{xref:RISK-03}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| External systems list ... | spec         | Yes             |
| For each external system: | spec         | Yes             |
| ○ ext_id                  | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ direction (inbound/o... | spec         | Yes             |
| ○ trust classification... | spec         | Yes             |
| ○ auth mechanism (keys... | spec         | Yes             |
| ○ data exchanged (high... | spec         | Yes             |
| ○ PII classification (... | spec         | Yes             |
| ○ integrity guarantees... | spec         | Yes             |
| ○ rate limits/quotas (... | spec         | Yes             |

## 5. Optional Fields

● Diagrams/pointers | OPTIONAL
● Data residency constraints | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- All inbound data must be validated at the boundary (schema + auth + integrity).
- Secrets must not be stored in code; must reference secrets management policy
- **(ENV/SKM).**
- Webhook integrity must include replay protection (timestamp + nonce / signature policy).
- Any PII crossing boundaries must follow DGP classification and retention rules.
- Failures must be categorized and mapped to ERR taxonomy (dependency errors).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Integration Landscape (required)`
2. `## name`
3. `## direction`
4. `## purpose`
5. `## trust`
6. `## auth`
7. `## data_c`
8. `## ategori`
9. `## pii_cl`
10. `## ass`

## 8. Cross-References

- Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:SIC-01}} | OPTIONAL, {{xref:RISK-03}} |
- OPTIONAL
- Downstream: {{xref:SIC-02}}, {{xref:SIC-03}}, {{xref:SIC-04}}, {{xref:SIC-05}},
- **{{xref:SIC-06}} | OPTIONAL, {{xref:ERR-01}} | OPTIONAL, {{xref:SKM-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
- {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
