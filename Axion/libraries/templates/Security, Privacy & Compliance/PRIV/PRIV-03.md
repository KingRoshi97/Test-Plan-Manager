# PRIV-03 — Data Minimization Rules (collect/store/share)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-03                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data minimization rules (collect/store/share)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Minimization Rules (collect/store/share) Document                         |

## 2. Purpose

Define the canonical data minimization rules: what data is allowed to be collected/stored/shared,
what is prohibited, and how teams justify data collection. This template must align with the data
inventory and PII tiering model.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Product overview/scope: {{xref:PRD-01}} | OPTIONAL
- File security: {{xref:FMS-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Minimization principle... | spec         | Yes             |
| Collection rules (only... | spec         | Yes             |
| Storage rules (store m... | spec         | Yes             |
| Sharing rules (default... | spec         | Yes             |
| Prohibited data catego... | spec         | Yes             |
| Justification process ... | spec         | Yes             |
| Approval roles (who ap... | spec         | Yes             |
| Reference to deletion/... | spec         | Yes             |

## 5. Optional Fields

Examples of allowed vs disallowed | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Default is minimize: if not needed for a defined purpose, do not collect/store.
New data collection must be reviewed/approved.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Principles
principles:
{{principles[0]}}
{{principles[1]}}
{{principles[2]}}
2. Collection Rules
rules: {{collect.rules}}
3. Storage Rules
rules: {{store.rules}}
4. Sharing Rules
rules: {{share.rules}}
5. Prohibited Data
prohibited_types: {{ban.types}}
prohibited_tiers: {{ban.tiers}} | OPTIONAL
6. Justification & Approvals
justification_required_fields: {{justify.fields}}
approver_roles: {{approve.roles}}
workflow_steps: {{approve.steps}} | OPTIONAL
7. Telemetry
minimization_violation_metric: {{telemetry.violation_metric}}
new_field_added_metric: {{telemetry.new_field_metric}} | OPTIONAL
8. Retention/Deletion Reference
retention_ref: {{xref:PRIV-05}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PRIV-05}}, {{xref:COMP-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define principles, prohibited data, and approvals.
intermediate: Required. Define justification fields and telemetry and sharing rules.
advanced: Required. Add examples and strict “new field” governance and audit trails.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional tiers, workflow steps, optional
metrics, examples, open_questions

If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If principles is UNKNOWN → block Completeness Gate.
If ban.types is UNKNOWN → block Completeness Gate.
If approve.roles is UNKNOWN → block Completeness Gate.
If telemetry.violation_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
principles_defined == true
prohibited_data_defined == true
approvals_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-04

PRIV-04 — Consent Model (capture, storage, enforcement)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Default is minimize: if not needed for a defined purpose, do not collect/store.**
- **New data collection must be reviewed/approved.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Principles`
2. `## principles:`
3. `## Collection Rules`
4. `## Storage Rules`
5. `## Sharing Rules`
6. `## Prohibited Data`
7. `## Justification & Approvals`
8. `## Telemetry`
9. `## Retention/Deletion Reference`

## 8. Cross-References

- **Upstream: {{xref:PRIV-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-05}}, {{xref:COMP-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
