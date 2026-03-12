# DLR-02 — Retention Policy Matrix (by data

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DLR-02                                             |
| Template Type     | Data / Lifecycle                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retention policy matrix (by data    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retention Policy Matrix (by data Document                         |

## 2. Purpose

Define the canonical retention periods and deletion requirements for each entity/data class: how
long data is kept, what triggers retention timers, what rules apply for archival, and what
legal/compliance constraints exist.

## 3. Inputs Required

- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DLR-01: {{xref:DLR-01}} | OPTIONAL
- ● COMP-01: {{xref:COMP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| For each entry:           | spec         | Yes             |
| ○ entity_id / dataset     | spec         | Yes             |
| ○ data_class (PII leve... | spec         | Yes             |
| ○ retention_period (du... | spec         | Yes             |
| ○ storage tier (hot/co... | spec         | Yes             |
| ○ deletion type (soft/... | spec         | Yes             |
| ○ legal hold override ... | spec         | Yes             |
| ○ access constraints w... | spec         | Yes             |
| ○ export requirements ... | spec         | Yes             |
| ○ owner                   | spec         | Yes             |
| Compliance notes (regu... | spec         | Yes             |

## 5. Optional Fields

● Region-specific retention differences | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Retention must reference data classification (DGP/DGL).
- Legal holds override deletion and must be explicitly defined.
- Deletion type must align with DLR-03 procedures.
- Reporting and search retention must align to lifecycle state constraints.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Retention Matrix (canonical)`
3. `## entity`
4. `## _id`
5. `## data_`
6. `## class`
7. `## retent`
8. `## ion_p`
9. `## eriod`
10. `## start_`

## 8. Cross-References

- Upstream: {{xref:DGP-01}} | OPTIONAL, {{xref:DLR-01}} | OPTIONAL
- Downstream: {{xref:DLR-03}}, {{xref:DLR-04}}, {{xref:DLR-05}} | OPTIONAL,
- **{{xref:STORE-*}} | OPTIONAL**
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
