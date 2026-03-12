# COMP-02 — Control Matrix (control_id → requirement → evidence)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-02                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring control matrix (control_id → requirement → evidence)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Control Matrix (control_id → requirement → evidence) Document                         |

## 2. Purpose

Create the canonical control matrix mapping compliance controls to security/privacy
requirements and the evidence needed to prove them. This document is used for audits and
internal assurance and must align with the security baseline controls and privacy-by-design
checks.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Compliance scope: {{xref:COMP-01}} | OPTIONAL
- Security controls baseline: {{xref:SEC-03}} | OPTIONAL
- Privacy checklist: {{xref:PRIV-07}} | OPTIONAL
- Audit integrity model: {{xref:AUDIT-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Control registry (control_id list)
control_id (stable identifier)
Framework mapping (which framework clause)
Requirement statement (what must be true)
Owner (team/role)
Evidence artifacts list (reports/logs/config)
Evidence cadence (how often)
Test/verification method (test/manual/report)
Status (planned/in_place/UNKNOWN)
Exception process reference (COMP-08)

Optional Fields
Automated evidence collection support | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every control must have evidence and a cadence; no “TBD” without an exception record.
Evidence must be storable and reviewable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_controls: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Controls (repeat per control_id)
Control
control_id: {{controls[0].control_id}}
framework_clause: {{controls[0].framework_clause}}
requirement: {{controls[0].requirement}}
owner: {{controls[0].owner}}
evidence_artifacts: {{controls[0].evidence_artifacts}}
evidence_cadence: {{controls[0].evidence_cadence}}
verification_method: {{controls[0].verification_method}}
status: {{controls[0].status}}
exceptions_ref: {{controls[0].exceptions_ref}} (expected: {{xref:COMP-08}}) | OPTIONAL
automation_notes: {{controls[0].automation_notes}} | OPTIONAL
(Repeat per control.)
3. References
Exception management: {{xref:COMP-08}} | OPTIONAL
Evidence collection plan: {{xref:COMP-09}} | OPTIONAL
Cross-References
Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define control registry and requirement statements and evidence artifacts.
intermediate: Required. Define cadence, owners, and verification methods.
advanced: Required. Add automation notes and strict framework clause mapping and status
rigor.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, exceptions ref, automation notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If controls[].control_id is UNKNOWN → block Completeness Gate.
If controls[].requirement is UNKNOWN → block Completeness Gate.
If controls[].evidence_artifacts is UNKNOWN → block Completeness Gate.
If controls[].evidence_cadence is UNKNOWN → block Completeness Gate.
If controls[*].verification_method is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
control_registry_defined == true
evidence_and_cadence_defined == true
verification_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-03

COMP-03 — Vendor Risk Management (third-party reviews, DPAs)
Header Block

## 5. Optional Fields

Automated evidence collection support | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every control must have evidence and a cadence; no “TBD” without an exception record.**
- **Evidence must be storable and reviewable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Controls (repeat per control_id)`
3. `## Control`
4. `## (Repeat per control.)`
5. `## References`

## 8. Cross-References

- **Upstream: {{xref:COMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-09}}, {{xref:COMP-10}} | OPTIONAL**
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
