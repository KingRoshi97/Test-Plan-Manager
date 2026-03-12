# TMA-04 — Risk Register (threats, likelihood, impact, mitigations)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | TMA-04                                             |
| Template Type     | Security / Threat Modeling                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring risk register (threats, likelihood, impact, mitigations)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Risk Register (threats, likelihood, impact, mitigations) Document                         |

## 2. Purpose

Define the canonical risk register for threats and abuse: each risk item, what it impacts,
likelihood/impact ratings, existing mitigations, gaps, owners, and tracking status. This template
must align with abuse cases and security baseline controls and should be used to drive
remediation work.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Threat model scope/method: {{xref:TMA-01}} | OPTIONAL
- Abuse case catalog: {{xref:TMA-02}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Security baseline controls: {{xref:SEC-03}} | OPTIONAL
- Risk assessment process: {{xref:COMP-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Risk registry (risk_id... | spec         | Yes             |
| risk_id (stable identi... | spec         | Yes             |
| Title/description         | spec         | Yes             |
| Linked abuse_id or thr... | spec         | Yes             |
| Impacted surfaces (sur... | spec         | Yes             |
| Impacted assets (asset... | spec         | Yes             |
| Likelihood rating (low... | spec         | Yes             |
| Impact rating (low/med... | spec         | Yes             |
| Overall risk rating (d... | spec         | Yes             |
| Existing mitigations (... | spec         | Yes             |
| Gaps/needed mitigations   | spec         | Yes             |
| Owner                     | spec         | Yes             |

## 5. Optional Fields

Due date | OPTIONAL
Risk acceptance record (if accepted) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Each risk must link to at least one mitigation or explicitly state NONE + gap.
- **Risk acceptance must follow SEC-08/COMP-08 (time-bound, approved).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Risk Items (repeat per risk_id)`
3. `## Risk`
4. `## open_questions:`
5. `## (Repeat per risk.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:TMA-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:TMA-05}}, {{xref:SEC-06}} | OPTIONAL**
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
