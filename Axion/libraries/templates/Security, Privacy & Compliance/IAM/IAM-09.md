# IAM-09 — Access Reviews (periodic review, attestations)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-09                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring access reviews (periodic review, attestations)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Access Reviews (periodic review, attestations) Document                         |

## 2. Purpose

Define the canonical access review process: who is reviewed (privileged roles, API keys,
service identities), how often, what evidence is captured, and how removals are executed and
audited. This template must align with privileged access policy and compliance risk assessment
expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Role/perm model: {{xref:IAM-01}} | OPTIONAL
- Privileged access policy: {{xref:IAM-06}} | OPTIONAL
- Risk assessment process: {{xref:COMP-07}} | OPTIONAL
- Privileged actions audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Review scope (what acc... | spec         | Yes             |
| Review cadence (monthl... | spec         | Yes             |
| Reviewer roles (who at... | spec         | Yes             |
| Evidence required (exp... | spec         | Yes             |
| Remediation rules (rem... | spec         | Yes             |
| Escalation rules (non-... | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |

## 5. Optional Fields

Automated review support | OPTIONAL

Sampling rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Reviews must include privileged roles and machine credentials at minimum.**
- **Remediations must be tracked to closure.**
- **Evidence must be stored in an audit-safe location.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Scope`
2. `## Cadence & Reviewers`
3. `## Evidence`
4. `## Workflow`
5. `## steps:`
6. `## Remediation`
7. `## Escalation`
8. `## Audit`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:IAM-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-06}}, {{xref:COMP-10}} | OPTIONAL**
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
