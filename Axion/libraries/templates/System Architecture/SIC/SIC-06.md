# SIC-06 — Vendor/Third-Party Trust Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SIC-06                                             |
| Template Type     | Architecture / Interfaces                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring vendor/third-party trust model    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Vendor/Third-Party Trust Model Document                         |

## 2. Purpose

Define how we trust and govern third-party vendors: what data they can access, what
scopes/permissions apply, how we audit their access, and what compliance constraints exist.
This prevents accidental over-sharing and supports vendor risk management.

## 3. Inputs Required

- ● SIC-01: {{xref:SIC-01}} | OPTIONAL
- ● ARC-07: {{xref:ARC-07}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● SEC-02: {{xref:SEC-02}} | OPTIONAL
- ● COMP-05: {{xref:COMP-05}} | OPTIONAL
- ● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Vendor list (from SIC-... | spec         | Yes             |
| For each vendor:          | spec         | Yes             |
| ○ vendor_id (align to ... | spec         | Yes             |
| ○ trust tier (low/medi... | spec         | Yes             |
| ○ data access scope (c... | spec         | Yes             |
| ○ auth scope model (OA... | spec         | Yes             |
| ○ least-privilege cons... | spec         | Yes             |
| ○ data retention/shari... | spec         | Yes             |
| ○ breach notification ... | spec         | Yes             |
| ○ exit strategy (how t... | spec         | Yes             |
| Review cadence (access... | spec         | Yes             |

## 5. Optional Fields

● Vendor scoring rubric | OPTIONAL

● Contracts/SLA pointers | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Least privilege is mandatory: no broad scopes without justification.
- High-trust vendors still require auditability; trust does not remove logging.
- Exit strategy must be defined for every vendor with data access.
- Any high-PII sharing requires explicit approval and retention rules.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Trust Tiers (required)`
2. `## tier`
3. `## meaning`
4. `## typical_controls`
5. `## approval_required`
6. `## low`
7. `## medium`
8. `## high`
9. `## 2) Vendor Trust Registry (canonical)`
10. `## interfa`

## 8. Cross-References

- Upstream: {{xref:SIC-01}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL, {{xref:COMP-05}} |
- OPTIONAL
- Downstream: {{xref:GOVOPS-}} | OPTIONAL, {{xref:COMP-02}} | OPTIONAL,
- **{{xref:AUDIT-}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
