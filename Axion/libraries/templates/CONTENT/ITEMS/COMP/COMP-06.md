# COMP-06 — Regulatory Requirements (CAN-SPAM, PCI, SOC2, HIPAA, etc.)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-06                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring regulatory requirements (can-spam, pci, soc2, hipaa, etc.)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Regulatory Requirements (CAN-SPAM, PCI, SOC2, HIPAA, etc.) Document                         |

## 2. Purpose

Define the canonical list of applicable regulatory requirements and what the system must do to
comply (at a requirements level). This template must not claim certifications, and must link
requirements to the relevant system policies (payments, notifications, retention, audit).

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Payments security: {{xref:PAY-09}} | OPTIONAL
- Notification send policy: {{xref:NOTIF-04}} | OPTIONAL
- Audit retention/access: {{xref:AUDIT-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Regulation registry (r... | spec         | Yes             |
| reg_id (stable identif... | spec         | Yes             |
| Regulation/framework name | spec         | Yes             |
| Applicability statemen... | spec         | Yes             |
| System requirements li... | spec         | Yes             |
| Evidence expectations ... | spec         | Yes             |
| Owner (who ensures)       | spec         | Yes             |
| Review cadence            | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Jurisdiction scope notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Do not claim “compliant” unless proven; describe “requirements” only.
Each regulation entry must map to at least one system policy/doc reference.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_regs: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Regulations (repeat)
Regulation
reg_id: {{regs[0].reg_id}}
name: {{regs[0].name}}
applicability: {{regs[0].applicability}}
requirements: {{regs[0].requirements}}
evidence: {{regs[0].evidence}}
owner: {{regs[0].owner}}
review_cadence: {{regs[0].review_cadence}}
telemetry_metric: {{regs[0].telemetry_metric}}
jurisdiction_notes: {{regs[0].jurisdiction_notes}} | OPTIONAL
open_questions:
{{regs[0].open_questions[0]}} | OPTIONAL
(Repeat per regulation.)
3. References
Payments security: {{xref:PAY-09}} | OPTIONAL
Notification policy: {{xref:NOTIF-04}} | OPTIONAL
Retention/deletion: {{xref:PRIV-05}} | OPTIONAL
Audit retention: {{xref:AUDIT-05}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-02}}, {{xref:COMP-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define reg list, applicability, and requirements.
intermediate: Required. Add evidence, owners, cadence, telemetry.
advanced: Required. Add jurisdiction scope notes and stricter policy/doc references per
requirement.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, jurisdiction notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If regs[].reg_id is UNKNOWN → block Completeness Gate.
If regs[].requirements is UNKNOWN → block Completeness Gate.
If regs[].evidence is UNKNOWN → block Completeness Gate.
If regs[].owner is UNKNOWN → block Completeness Gate.
If regs[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
reg_registry_defined == true
requirements_and_evidence_defined == true
owners_and_cadence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-07

COMP-07 — Risk Assessments (periodic, triggers, owners)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Do not claim “compliant” unless proven; describe “requirements” only.
- Each regulation entry must map to at least one system policy/doc reference.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Regulations (repeat)`
3. `## Regulation`
4. `## open_questions:`
5. `## (Repeat per regulation.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-02}}, {{xref:COMP-09}} | OPTIONAL**
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
