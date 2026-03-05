# DGL-03 — Transformation Rules Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DGL-03                                             |
| Template Type     | Data / Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring transformation rules catalog    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Transformation Rules Catalog Document                         |

## 2. Purpose

Define the canonical catalog of transformation rules applied to data as it moves through the
system: mapping, normalization, enrichment, redaction, aggregation, and formatting rules. This
prevents undocumented transforms and supports repeatability and audits.

## 3. Inputs Required

- ● DGL-02: {{xref:DGL-02}} | OPTIONAL
- ● SIC-04: {{xref:SIC-04}} | OPTIONAL
- ● DLR-06: {{xref:DLR-06}} | OPTIONAL
- ● DQV-01: {{xref:DQV-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Transformation rule catalog (minimum 20 rules for non-trivial systems; justify if smaller)
● For each rule:
○ rule_id
○ name
○ category (normalize/map/enrich/aggregate/redact)
○ inputs (fields/entities)
○ output (fields/entities)
○ transform logic description (deterministic)
○ validation rule/predicate
○ failure behavior (reject/quarantine/default)
○ reason_code on failure (if reject)
○ owner
○ applied_in (transform step IDs from DGL-02)
○ data minimization impact (what is removed/trimmed) | OPTIONAL

## 5. Optional Fields

● Example input/output pairs | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- Transform logic must be deterministic and described without code.
- Any “default” behavior must be explicit and justified.
- Redaction transforms must align with privacy policy and be irreversible where required.
- Every reject path must map to a reason_code.

## 7. Output Format

### Required Headings (in order)

1. `## Transformation Rules (canonical)`
2. `## categ`
3. `## ory`
4. `## nam`
5. `## input`
6. `## outpu`
7. `## logic`
8. `## validat`
9. `## ion`
10. `## failur`

## 8. Cross-References

- Upstream: {{xref:DGL-02}} | OPTIONAL, {{xref:SIC-04}} | OPTIONAL, {{xref:DLR-06}} |
- OPTIONAL
- Downstream: {{xref:DQV-02}} | OPTIONAL, {{xref:PIPE-04}} | OPTIONAL, {{xref:BI-03}} |
- OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
