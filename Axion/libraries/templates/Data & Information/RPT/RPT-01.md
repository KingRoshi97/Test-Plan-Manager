# RPT-01 — Reporting Surfaces Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RPT-01                                             |
| Template Type     | Data / Reporting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring reporting surfaces inventory    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Reporting Surfaces Inventory Document                         |

## 2. Purpose

Define where reporting exists in the product: dashboards, admin views, exports, scheduled
reports, and external BI surfaces. This makes reporting scope deterministic and ties it to
permissions, distribution, and metric definitions.

## 3. Inputs Required

- ● SMIP-01: {{xref:SMIP-01}} | OPTIONAL
- ● RPT-02: {{xref:RPT-02}} | OPTIONAL
- ● DGL-04: {{xref:DGL-04}} | OPTIONAL
- ● ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL
- ● DIST-03: {{xref:DIST-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each surface:         | spec         | Yes             |
| ○ surface_id              | spec         | Yes             |
| ○ platform (web/mobile... | spec         | Yes             |
| ○ location (route/scre... | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ audience (roles)        | spec         | Yes             |
| ○ metrics included (me... | spec         | Yes             |
| ○ data freshness expec... | spec         | Yes             |
| ○ delivery mode (inter... | spec         | Yes             |
| ○ permissions enforcem... | spec         | Yes             |
| ○ export constraints (... | spec         | Yes             |
| ○ observability signal... | spec         | Yes             |

## 5. Optional Fields

● Customer-facing vs internal separation notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Surfaces must not expose metrics without a canonical definition (RPT-02).
- Exports are privileged for sensitive data; define redaction and approvals.
- Freshness expectations must align with aggregation/snapshot strategy
- **(RPT-03/RPT-04).**
- Permissions must be explicit; “admin-only” still needs role definition.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Reporting Surfaces (canonical)`
3. `## platfo`
4. `## locati`
5. `## purp`
6. `## ose`
7. `## audie`
8. `## nce_r`
9. `## oles`
10. `## metri`

## 8. Cross-References

- Upstream: {{xref:SMIP-01}} | OPTIONAL, {{xref:DGL-04}} | OPTIONAL
- Downstream: {{xref:RPT-03}}, {{xref:RPT-04}}, {{xref:RPT-05}} | OPTIONAL,
- **{{xref:RPT-06}} | OPTIONAL**
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- {{surf
- aces[
- 1].no
- tes}}
- RPT-02
- RPT-01 — Reporting Surfaces Inventory
- (dashboards, exports, admin)
- Header Block
- template_id: RPT-01
- title: Reporting Surfaces Inventory (dashboards, exports, admin)
- type: reporting_aggregations
- template_version: 1.0.0
- output_path: 10_app/reporting/RPT-01_Reporting_Surfaces_Inventory.md
- compliance_gate_id: TMP-05.PRIMARY.RPT
- upstream_dependencies: ["SMIP-01", "RPT-02", "DGL-04"]
- inputs_required: ["SMIP-01", "RPT-02", "DGL-04", "ADMIN-01", "DIST-03",
- "STANDARDS_INDEX"]
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- Purpose
- **Define where reporting exists in the product: dashboards, admin views, exports, scheduled**
- reports, and external BI surfaces. This makes reporting scope deterministic and ties it to
- permissions, distribution, and metric definitions.
- Inputs Required
- SMIP-01: {{xref:SMIP-01}} | OPTIONAL
- RPT-02: {{xref:RPT-02}} | OPTIONAL
- DGL-04: {{xref:DGL-04}} | OPTIONAL
- ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL
- DIST-03: {{xref:DIST-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Required Fields
- Reporting surfaces list (minimum 6 if product has reporting; otherwise mark N/A)
- For each surface:
- ○ surface_id
- ○ platform (web/mobile/admin/external)
- ○ locati

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
