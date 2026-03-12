# SIC-01 — External Interface Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIC-01                                             |
| Template Type     | Architecture / Interfaces                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring external interface inventory    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled External Interface Inventory Document                         |

## 2. Purpose

List every external interface the system interacts with and define high-level constraints per
interface: directionality, purpose, data sensitivity, trust classification, and where detailed
contracts live. This makes integration scope deterministic and auditable.

## 3. Inputs Required

- ● ARC-07: {{xref:ARC-07}} | OPTIONAL
- ● RISK-03: {{xref:RISK-03}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each interface:       | spec         | Yes             |
| ○ interface_id            | spec         | Yes             |
| ○ external_system_name    | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ direction (inbound/o... | spec         | Yes             |
| ○ auth mechanism (API ... | spec         | Yes             |
| ○ trust classification... | spec         | Yes             |
| ○ data categories exch... | spec         | Yes             |
| ○ PII classification p... | spec         | Yes             |
| ○ expected volume/late... | spec         | Yes             |
| ○ rate limits/quotas (... | spec         | Yes             |
| ○ owner (internal)        | spec         | Yes             |

## 5. Optional Fields

● Vendor contact/SLAs | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false (no integrations), include 00_NA block only.
- Every interface must have a detailed contract pointer or be flagged as incomplete.
- Trust classification drives validation and audit requirements (SEC/DGP rules).
- Do not include internal APIs here; only cross-org/system boundaries.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) External Interface Inventory (canonical)`
3. `## syst`
4. `## pur`
5. `## pos`
6. `## dire`
7. `## ctio`
8. `## typ`
9. `## aut`
10. `## tru`

## 8. Cross-References

- Upstream: {{xref:ARC-07}} | OPTIONAL, {{xref:RISK-03}} | OPTIONAL
- Downstream: {{xref:SIC-02}}, {{xref:SIC-03}}, {{xref:SIC-04}}, {{xref:SIC-05}},
- **{{xref:SIC-06}} | OPTIONAL**
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
