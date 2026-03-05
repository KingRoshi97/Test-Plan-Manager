# RPT-05 — Data Access & Permissions for

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RPT-05                                             |
| Template Type     | Data / Reporting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data access & permissions for    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Access & Permissions for Document                         |

## 2. Purpose

Define reporting-specific permissions: who can view which dashboards, slices, and exports;
what row-level/tenant-level constraints apply; what redaction rules apply; and how report access
is audited.

## 3. Inputs Required

- ● RPT-01: {{xref:RPT-01}} | OPTIONAL
- ● DGL-04: {{xref:DGL-04}} | OPTIONAL
- ● PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Report access matrix (... | spec         | Yes             |
| For each entry:           | spec         | Yes             |
| ○ rpt_surface_id (from... | spec         | Yes             |
| ○ metric_id(s) visible    | spec         | Yes             |
| ○ audience roles          | spec         | Yes             |
| ○ row-level constraint... | spec         | Yes             |
| ○ export allowed (yes/no) | spec         | Yes             |
| ○ export redaction rul... | spec         | Yes             |
| ○ approval required (y... | spec         | Yes             |
| ○ audit event requirement | spec         | Yes             |
| ○ anti-reidentificatio... | spec         | Yes             |
| Global rules:             | spec         | Yes             |

## 5. Optional Fields

● External sharing rules | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Reporting access must align with PMAD/DGL access controls.
- Exports of sensitive data require stricter approvals and redaction.
- Small cohort breakdowns must be blocked or bucketed to prevent reidentification.
- Access to report exports should be auditable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Report Access Matrix (canonical)`
2. `## rpt_su`
3. `## rface_i`
4. `## metric`
5. `## roles`
6. `## row_c`
7. `## onstr`
8. `## aints`
9. `## export`
10. `## _allow`

## 8. Cross-References

- Upstream: {{xref:RPT-01}} | OPTIONAL, {{xref:DGL-04}} | OPTIONAL, {{xref:PMAD-02}}
- | OPTIONAL
- Downstream: {{xref:RPT-06}} | OPTIONAL, {{xref:COMP-02}} | OPTIONAL,
- **{{xref:ADMIN-03}} | OPTIONAL**
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
