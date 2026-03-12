# DLR-06 — Data Minimization Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DLR-06                                             |
| Template Type     | Data / Lifecycle                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data minimization rules    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Minimization Rules Document                         |

## 2. Purpose

Define rules to minimize collected and stored data: which fields are necessary, which are
optional, when data should be avoided, and what alternatives exist. This reduces privacy risk
and storage cost while supporting product requirements.

## 3. Inputs Required

- ● PRD-06: {{xref:PRD-06}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● DGP-02: {{xref:DGP-02}} | OPTIONAL
- ● FORM-01: {{xref:FORM-01}} | OPTIONAL
- ● API-02: {{xref:API-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Minimization principle... | spec         | Yes             |
| “Do not collect” list ... | spec         | Yes             |
| Required justification... | spec         | Yes             |
| Storage minimization r... | spec         | Yes             |
| ○ avoid duplication       | spec         | Yes             |
| ○ store derived values... | spec         | Yes             |
| ○ redact/trim logs        | spec         | Yes             |
| UX constraints:           | spec         | Yes             |
| ○ optional fields must... | spec         | Yes             |
| ○ explain why requeste... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Field-level minimization matrix | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- **(collect/store only what’s needed)**
- **Header Block**
- template_id: DLR-06
- title: Data Minimization Rules (collect/store only what’s needed)
- type: data_lifecycle_retention
- template_version: 1.0.0
- output_path: 10_app/data_lifecycle/DLR-06_Data_Minimization_Rules.md
- compliance_gate_id: TMP-05.PRIMARY.DLR
- upstream_dependencies: ["PRD-06", "DGP-01", "DGP-02"]
- inputs_required: ["PRD-06", "DGP-01", "DGP-02", "FORM-01", "API-02",
- **"STANDARDS_INDEX"]**
- required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}
- **Purpose**
- **Define rules to minimize collected and stored data: which fields are necessary, which are**
- **optional, when data should be avoided, and what alternatives exist. This reduces privacy risk**
- **and storage cost while supporting product requirements.**
- **Inputs Required**
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- DGP-01: {{xref:DGP-01}} | OPTIONAL
- DGP-02: {{xref:DGP-02}} | OPTIONAL
- FORM-01: {{xref:FORM-01}} | OPTIONAL
- API-02: {{xref:API-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- **Required Fields**
- Minimization principles (explicit)
- “Do not collect” list (fields/data types)
- “Collect only when needed” list (conditional fields with triggers)
- Required justification rules for high-PII fields
- Storage minimization rules:
- **○ avoid duplication**
- **○ store derived values only when needed**
- **○ redact/trim logs**
- UX constraints:
- **○ optional fields must be optional in UX**
- **○ explain why requested (copy pointer)**
- Verification checklist
- **Optional Fields**
- Field-level minimization matrix | OPTIONAL
- Notes | OPTIONAL
- **Rules**
- If a field is optional in product logic, it must not be required in forms.
- High-PII fields require explicit business justification and retention policy.
- Logs/telemetry must follow minimization; do not collect full payloads by default.
- “Just in case” collection is disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Principles (required)`
2. `## 2) Do Not Collect (required)`
3. `## 3) Collect Only When Needed (required)`
4. `## field_or_data`
5. `## collect_when`
6. `## field}}`
7. `## when}}`
8. `## purpose`
9. `## retention_pointer`
10. `## rpose}}`

## 8. Cross-References

- Upstream: {{xref:DGP-01}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL
- Downstream: {{xref:DLR-02}} | OPTIONAL, {{xref:DQV-03}} | OPTIONAL,
- **{{xref:OBS-01}} | OPTIONAL**
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
