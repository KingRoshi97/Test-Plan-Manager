# IAM-04 — Authorization Enforcement Points (where checks happen)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-04                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring authorization enforcement points (where checks happen)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Authorization Enforcement Points (where checks happen) Document                         |

## 2. Purpose

Define the canonical set of authorization enforcement points (AEPs): where AuthZ checks occur
across API, background jobs, websockets, admin surfaces, and client routing. This template
ensures AuthZ is enforced server-side and consistently instrumented.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API surface: {{xref:API-01}} | OPTIONAL
- AuthZ rules: {{xref:API-04}} | OPTIONAL
- Route guard rules: {{xref:ROUTE-04}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Privileged API catalog: {{xref:ADMIN-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Enforcement point regi... | spec         | Yes             |
| aep_id (stable identif... | spec         | Yes             |
| surface type (api/ws/j... | spec         | Yes             |
| location (middleware/h... | spec         | Yes             |
| What is checked (role/... | spec         | Yes             |
| Decision inputs (user_... | spec         | Yes             |
| Decision outputs (allo... | spec         | Yes             |
| Logging/telemetry requ... | spec         | Yes             |
| Fail-closed rule (deny... | spec         | Yes             |
| Test coverage requirem... | spec         | Yes             |

## 5. Optional Fields

Policy evaluation caching rules | OPTIONAL

Partial authorization (field-level) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Critical authorization decisions MUST be enforced server-side at AEPs.**
- **AEPs must fail closed on policy engine errors.**
- **Every denial should produce a reason code for audit/diagnosis.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Enforcement Points (repeat per aep_id)`
3. `## AEP`
4. `## telemetry:`
5. `## (Repeat per AEP.)`
6. `## Logging / Reason Codes`
7. `## Testing Requirements`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-10}}, {{xref:AUDIT-03}} | OPTIONAL**
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
