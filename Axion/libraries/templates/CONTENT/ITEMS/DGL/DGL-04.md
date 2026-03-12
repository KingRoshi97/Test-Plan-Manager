# DGL-04 — Access Controls for Data (who

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DGL-04                                             |
| Template Type     | Data / Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring access controls for data (who    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Access Controls for Data (who Document                         |

## 2. Purpose

Define the data-layer access control rules: who can read/write/export which entities/datasets,
what constraints apply for sensitive data, and what approval/audit requirements exist.

## 3. Inputs Required

- ● PMAD-02: {{xref:PMAD-02}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● DGL-01: {{xref:DGL-01}} | OPTIONAL
- ● COMP-01: {{xref:COMP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Access control matrix ... | spec         | Yes             |
| For each entry:           | spec         | Yes             |
| ○ entity_id/dataset_id    | spec         | Yes             |
| ○ action (read/write/e... | spec         | Yes             |
| ○ allowed roles (role_id) | spec         | Yes             |
| ○ constraints (tenant/... | spec         | Yes             |
| ○ approval required (y... | spec         | Yes             |
| ○ audit required (yes/... | spec         | Yes             |
| ○ masking/redaction ru... | spec         | Yes             |
| Export policy (bulk ex... | spec         | Yes             |
| Break-glass rules poin... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Data masking patterns | OPTIONAL
● Notes | OPTIONAL

Rules
● Export is treated as privileged for high-PII datasets.
● Masking/redaction must be explicit for sensitive fields.
● Access rules must align with PMAD policy rules; do not create contradictory rules.
● All access to sensitive datasets must be auditable.

Output Format
1) Access Control Matrix (canonical)
id

kind

action

allowe
d_role
s

constrain
ts

approval

audit_e
vent

masking
_rules

{{matri {{matrix {{matrix[
x[0].id [0].kind 0].actio
}}
}}
n}}

{{matrix
[0].role
s}}

{{matrix[0]
.constraint
s}}

{{matrix[0
].approva
l}}

{{matrix
[0].audi
t}}

{{matrix[0 {{matrix
].maskin [0].note
g}}
s}}

{{matri {{matrix {{matrix[
x[1].id [1].kind 1].actio
}}
}}
n}}

{{matrix
[1].role
s}}

{{matrix[1]
.constraint
s}}

{{matrix[1
].approva
l}}

{{matrix
[1].audi
t}}

{{matrix[1 {{matrix
].maskin [1].note
g}}
s}}

2) Export Policy (required)
● Export allowed when: {{export.allowed_when}}
● Export denied when: {{export.denied_when}}
● Approval requirement: {{export.approval}}
● Rate limits for export: {{export.ratelimits}} | OPTIONAL

3) Break-Glass Pointer (required)
● PMAD-05 pointer: {{xref:PMAD-05}} | OPTIONAL

notes

4) Verification Checklist (required)
● {{verify[0]}}
● {{verify[1]}}
● {{verify[2]}} | OPTIONAL

Cross-References
● Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL
● Downstream: {{xref:DGL-05}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL,
{{xref:ADMIN-02}} | OPTIONAL
● Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
● beginner: Required. Matrix with read/write basics and audit flags.
● intermediate: Required. Add export rules and masking for sensitive data.
● advanced: Required. Add approval governance and verification checklist rigor.

Unknown Handling
● UNKNOWN_ALLOWED: masking_patterns, notes, ratelimits
● If any sensitive dataset lacks audit_event requirement → block Completeness Gate.

Completeness Gate
● Gate ID: TMP-05.PRIMARY.DGL

● Pass conditions:
○ required_fields_present == true
○ matrix_count >= 20
○ export_policy_present == true
○ sensitive_access_audited == true
○ placeholder_resolution == true
○ no_unapproved_unknowns == true

DGL-04

DGL-05 — Auditability Requirements
(what must be traceable)
Header Block
● template_id: DGL-05
● title: Auditability Requirements (what must be traceable)
● type: data_governance_lineage
● template_version: 1.0.0
● output_path: 10_app/data_governance/DGL-05_Auditability_Requirements.md
● compliance_gate_id: TMP-05.PRIMARY.DGL
● upstream_dependencies: ["PMAD-06", "AUDIT-01", "DGL-04"]
● inputs_required: ["PMAD-06", "AUDIT-01", "DGL-04", "DGP-01", "OBS-01",
"STANDARDS_INDEX"]
● required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}

Purpose
Define what data actions must be traceable end-to-end: create/update/delete, access, exports,
transformations, and administrative repairs. This consolidates audit requirements into a
concrete checklist and event catalog.

Inputs Required
● PMAD-06: {{xref:PMAD-06}} | OPTIONAL
● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
● DGL-04: {{xref:DGL-04}} | OPTIONAL

● DGP-01: {{xref:DGP-01}} | OPTIONAL
● OBS-01: {{xref:OBS-01}} | OPTIONAL
● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

Required Fields
● Traceability event catalog (minimum 25 events)
● For each event:
○ event_id
○ category (data_write/data_read/da

## 6. Rules

- Export is treated as privileged for high-PII datasets.
- Masking/redaction must be explicit for sensitive fields.
- Access rules must align with PMAD policy rules; do not create contradictory rules.
- All access to sensitive datasets must be auditable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Access Control Matrix (canonical)`
2. `## kind`
3. `## action`
4. `## allowe`
5. `## d_role`
6. `## constrain`
7. `## approval`
8. `## audit_e`
9. `## vent`
10. `## masking`

## 8. Cross-References

- Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL
- Downstream: {{xref:DGL-05}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL,
- **{{xref:ADMIN-02}} | OPTIONAL**
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
