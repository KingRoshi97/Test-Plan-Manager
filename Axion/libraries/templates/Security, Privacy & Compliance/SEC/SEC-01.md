# SEC-01 — Security Overview (scope, principles, threat posture)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-01                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security overview (scope, principles, threat posture)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Overview (scope, principles, threat posture) Document                         |

## 2. Purpose

Create the single, canonical overview of the security posture for the product: scope, security
principles, assumed threats, and what “secure” means for this build. This document sets the
baseline expectations for all downstream security/privacy/compliance docs and must not invent
guarantees beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PRD-06 NFRs/Security constraints: {{prd.nfrs}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Security scope (in-sco... | spec         | Yes             |
| Out-of-scope statement... | spec         | Yes             |
| Security principles li... | spec         | Yes             |
| Threat posture summary... | spec         | Yes             |
| Trust assumptions (wha... | spec         | Yes             |
| Data sensitivity summa... | spec         | Yes             |
| Security ownership (wh... | spec         | Yes             |
| Security review cadenc... | spec         | Yes             |
| Known gaps / exception... | spec         | Yes             |
| References to core sec... | spec         | Yes             |

## 5. Optional Fields

Product risk tier | OPTIONAL
External compliance drivers summary | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Every statement must be traceable to upstream inputs or marked UNKNOWN.
Do not claim compliance certifications unless explicitly provided.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Scope
In-scope surfaces:
{{scope.in[0]}}
{{scope.in[1]}}
Out-of-scope (explicit):
{{scope.out[0]}}
{{scope.out[1]}}
2. Security Principles
{{principles[0]}}
{{principles[1]}}
{{principles[2]}}
3. Threat Posture
Primary threat classes:
{{threats[0]}}
{{threats[1]}}
{{threats[2]}}
Assumed attacker capability: {{threats.attacker_model}} | OPTIONAL
4. Trust Assumptions
{{assumptions[0]}}
{{assumptions[1]}}
{{assumptions[2]}}
5. Data Sensitivity Summary
data_classes: {{data.classes}}
highest_risk_data: {{data.highest_risk}} | OPTIONAL
6. Ownership & Governance
security_owner: {{governance.owner}}
decision_process: {{governance.decision_process}} | OPTIONAL
review_cadence: {{governance.review_cadence}}
7. Known Gaps / Exceptions
exceptions_process_ref: {{xref:SEC-08}} | OPTIONAL
known_gaps:
{{gaps[0]}} | OPTIONAL
{{gaps[1]}} | OPTIONAL
8. References
Security architecture: {{xref:SEC-02}}
Security requirements: {{xref:SEC-03}} | OPTIONAL

Incident response: {{xref:SEC-05}} | OPTIONAL
Monitoring: {{xref:SEC-06}} | OPTIONAL
Secure SDLC: {{xref:SEC-07}} | OPTIONAL
Cross-References
Upstream: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SEC-02}}, {{xref:SEC-03}}, {{xref:SEC-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Fill required fields; mark UNKNOWN rather than inventing.
intermediate: Required. Replace UNKNOWN with sourced statements when inputs exist.
advanced: Required. Add crisp scope boundaries and explicit threat posture statements.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, prd.nfrs, attacker model, highest risk
data, decision process, known gaps, risk tier, compliance drivers, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.in is UNKNOWN → block Completeness Gate.
If principles is UNKNOWN → block Completeness Gate.
If governance.owner is UNKNOWN → block Completeness Gate.
If governance.review_cadence is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SEC
Pass conditions:
required_fields_present == true
scope_defined == true
principles_defined == true
ownership_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SEC-02

SEC-02 — Security Architecture (trust boundaries, data flows)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Every statement must be traceable to upstream inputs or marked UNKNOWN.**
- Do not claim compliance certifications unless explicitly provided.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## In-scope surfaces:`
3. `## Out-of-scope (explicit):`
4. `## Security Principles`
5. `## Threat Posture`
6. `## Primary threat classes:`
7. `## Trust Assumptions`
8. `## Data Sensitivity Summary`
9. `## Ownership & Governance`
10. `## Known Gaps / Exceptions`

## 8. Cross-References

- **Upstream: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-02}}, {{xref:SEC-03}}, {{xref:SEC-05}} | OPTIONAL**
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
