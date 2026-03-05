# COMP-01 — Compliance Scope (frameworks, in/out scope)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COMP-01                                             |
| Template Type     | Security / Compliance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring compliance scope (frameworks, in/out scope)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Compliance Scope (frameworks, in/out scope) Document                         |

## 2. Purpose

Define the canonical compliance scope: which frameworks/regulations apply, what is in-scope
and out-of-scope, and what parts of the system are covered. This document anchors the
compliance series and must not claim compliance certifications unless explicitly provided.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security overview: {{xref:SEC-01}} | OPTIONAL
- Data inventory: {{xref:PRIV-01}} | OPTIONAL
- Product overview: {{xref:PRD-01}} | OPTIONAL
- Integration inventory: {{xref:IXS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Frameworks/regulations... | spec         | Yes             |
| In-scope systems/surfaces | spec         | Yes             |
| Out-of-scope statement... | spec         | Yes             |
| Assumptions (what must... | spec         | Yes             |
| Compliance ownership (... | spec         | Yes             |
| Review cadence (when u... | spec         | Yes             |
| Evidence storage locat... | spec         | Yes             |
| References to downstre... | spec         | Yes             |

## 5. Optional Fields

Target certification goals | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Do not claim compliance status or certification unless provided by inputs.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Frameworks / Regulations
frameworks: {{scope.frameworks}}
2. Scope Boundaries
in_scope:
{{scope.in[0]}}
{{scope.in[1]}}
out_of_scope:
{{scope.out[0]}}
{{scope.out[1]}}
3. Assumptions
{{assumptions[0]}}
{{assumptions[1]}} | OPTIONAL
4. Ownership & Cadence
owner: {{gov.owner}}
review_cadence: {{gov.review_cadence}}
5. Evidence Storage
evidence_location: {{evidence.location}}
6. References
Control matrix: {{xref:COMP-02}} | OPTIONAL
Vendor risk: {{xref:COMP-03}} | OPTIONAL
Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
Cross-References
Upstream: {{xref:SEC-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COMP-02}}, {{xref:COMP-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define frameworks list and in/out scope and owner.
intermediate: Required. Define evidence location and review cadence.
advanced: Required. Add certification goals and explicit assumptions and strict references.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, certification goals, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.frameworks is UNKNOWN → block Completeness Gate.
If scope.in is UNKNOWN → block Completeness Gate.

If gov.owner is UNKNOWN → block Completeness Gate.
If evidence.location is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COMP
Pass conditions:
required_fields_present == true
frameworks_and_scope_defined == true
ownership_and_evidence_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COMP-02

COMP-02 — Control Matrix (control_id → requirement → evidence)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Do not claim compliance status or certification unless provided by inputs.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Frameworks / Regulations`
2. `## Scope Boundaries`
3. `## in_scope:`
4. `## out_of_scope:`
5. `## Assumptions`
6. `## Ownership & Cadence`
7. `## Evidence Storage`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SEC-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
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
