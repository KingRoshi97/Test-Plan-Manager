# IAM-06 — Admin & Privileged Access Policy (break-glass, step-up)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-06                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring admin & privileged access policy (break-glass, step-up)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Admin & Privileged Access Policy (break-glass, step-up) Document                         |

## 2. Purpose

Define the canonical policy for privileged access: admin roles, break-glass procedures, step-up
requirements, session constraints for admins, and audit controls. This template must be
consistent with role/permission model, MFA/step-up rules, and privileged action auditing.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Role/perm model: {{xref:IAM-01}} | OPTIONAL
- MFA/step-up rules: {{xref:SSO-07}} | OPTIONAL
- Admin capabilities matrix: {{xref:ADMIN-01}} | OPTIONAL
- Privileged actions audit: {{xref:AUDIT-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Privileged roles list ... | spec         | Yes             |
| What is considered pri... | spec         | Yes             |
| Step-up requirement ru... | spec         | Yes             |
| Break-glass supported ... | spec         | Yes             |
| Break-glass process (h... | spec         | Yes             |
| Admin session constrai... | spec         | Yes             |
| Approval requirements ... | spec         | Yes             |
| Audit requirements (al... | spec         | Yes             |
| Access review cadence ... | spec         | Yes             |

## 5. Optional Fields

Just-in-time access policy | OPTIONAL

Emergency contact rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Privileged access must require MFA/step-up when policy says so.**
- **Break-glass must be time-bound and auditable.**
- **Admin sessions must be stricter than standard user sessions where possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Privileged Definition`
2. `## Step-Up`
3. `## Break-Glass`
4. `## Admin Session Constraints`
5. `## Approvals`
6. `## Audit`
7. `## Reviews`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:IAM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-09}}, {{xref:SEC-06}} | OPTIONAL**
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
