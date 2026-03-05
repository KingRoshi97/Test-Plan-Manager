# SEC-08 — Security Exceptions Process (approvals, expiries, audit)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-08                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security exceptions process (approvals, expiries, audit)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Exceptions Process (approvals, expiries, audit) Document                         |

## 2. Purpose

Define the canonical process for requesting, approving, tracking, and expiring security
exceptions/waivers to baseline controls. This template must ensure exceptions are time-bound,
risk-assessed, auditable, and visible to operators/compliance.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security baseline controls: {{xref:SEC-03}} | OPTIONAL
- Compliance exception management: {{xref:COMP-08}} | OPTIONAL
- Privileged actions audit: {{xref:AUDIT-07}} | OPTIONAL
- Audit trail: {{xref:ADMIN-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Exception request sche... | spec         | Yes             |
| Approval roles (who ca... | spec         | Yes             |
| Risk assessment requir... | spec         | Yes             |
| Expiry requirement (ma... | spec         | Yes             |
| Compensating controls ... | spec         | Yes             |
| Tracking system/locati... | spec         | Yes             |
| Review cadence (period... | spec         | Yes             |
| Revocation process (ho... | spec         | Yes             |
| Audit logging requirem... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Emergency exception process | OPTIONAL

Exception templates by control category | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **No exceptions without expiry and compensating controls (unless explicitly allowed by policy).**
- **Approvals must be recorded and immutable (audit trail).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Exception Request Schema`
2. `## Approvals`
3. `## Risk Assessment`
4. `## Expiry`
5. `## Compensating Controls`
6. `## Tracking`
7. `## Reviews & Revocation`
8. `## Audit`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SEC-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-04}}, {{xref:COMP-09}} | OPTIONAL**
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
