# PRIV-07 — Privacy by Design Checklist (gates, reviews)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-07                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring privacy by design checklist (gates, reviews)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Privacy by Design Checklist (gates, reviews) Document                         |

## 2. Purpose

Define the canonical privacy-by-design checklist used in design/dev/release gates:
minimization, consent, retention, sharing, and logging redaction expectations. This template
must align with the privacy models and Secure SDLC gates.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PII classification: {{xref:PRIV-02}} | OPTIONAL
- Minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Secure SDLC policy: {{xref:SEC-07}} | OPTIONAL
- Compliance controls: {{xref:COMP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Checklist registry (ch... | spec         | Yes             |
| Check categories (coll... | spec         | Yes             |
| Checklist items per ca... | spec         | Yes             |
| Required review points... | spec         | Yes             |
| Evidence requirement (... | spec         | Yes             |
| Approver roles (privac... | spec         | Yes             |
| Exception handling ref... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

DPIA trigger rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Checklist items must be actionable and testable.
Exceptions must be time-bound and approved.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Categories
categories: {{cats.list}}
2. Checklist Items (repeat)
Check
check_id: {{checks[0].check_id}}
category: {{checks[0].category}}
statement: {{checks[0].statement}}
evidence: {{checks[0].evidence}}
review_point: {{checks[0].review_point}} (design/release/UNKNOWN)
approver_roles: {{checks[0].approver_roles}} | OPTIONAL
(Repeat per check.)
3. Reviews
required_review_points: {{reviews.points}}
workflow: {{reviews.workflow}} | OPTIONAL
4. Exceptions
exceptions_ref: {{exceptions.ref}} (expected: {{xref:COMP-08}}/{{xref:SEC-08}}) |
OPTIONAL
5. Telemetry
checks_completed_metric: {{telemetry.completed_metric}}
privacy_violation_metric: {{telemetry.violation_metric}} | OPTIONAL
6. References
Minimization: {{xref:PRIV-03}} | OPTIONAL
Retention/deletion: {{xref:PRIV-05}} | OPTIONAL
Logging rules: {{xref:SKM-09}} | OPTIONAL
Cross-References
Upstream: {{xref:PRIV-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-09}}, {{xref:PRIV-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define categories and core checks and review points.
intermediate: Required. Define evidence and approvers and telemetry.
advanced: Required. Add DPIA triggers and tighter exception/approval workflow and control
mapping.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, approver roles, workflow, exceptions ref,
optional metrics, dpia triggers, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If checks[].check_id is UNKNOWN → block Completeness Gate.
If checks[].statement is UNKNOWN → block Completeness Gate.
If checks[*].evidence is UNKNOWN → block Completeness Gate.
If telemetry.completed_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PRIV
Pass conditions:
required_fields_present == true
checklist_defined == true
evidence_defined == true
review_points_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PRIV-08

PRIV-08 — Anonymization/Pseudonymization Rules (hashing, tokenization)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- **Checklist items must be actionable and testable.**
- **Exceptions must be time-bound and approved.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Categories`
2. `## Checklist Items (repeat)`
3. `## Check`
4. `## (Repeat per check.)`
5. `## Reviews`
6. `## Exceptions`
7. `## OPTIONAL`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COMP-09}}, {{xref:PRIV-10}} | OPTIONAL**
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
