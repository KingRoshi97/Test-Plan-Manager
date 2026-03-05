# SKM-02 — Storage & Access Policy (vaults, env scoping, least privilege)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-02                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring storage & access policy (vaults, env scoping, least privilege)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Storage & Access Policy (vaults, env scoping, least privilege) Document                         |

## 2. Purpose

Define the canonical policy for where secrets are stored and how access is controlled:
vault/KMS usage, environment scoping, least privilege, auditability, and prohibited patterns. This
template must align with secrets inventory and baseline security controls.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Security baseline: {{xref:SEC-03}} | OPTIONAL
- Service-to-service auth: {{xref:IAM-05}} | OPTIONAL
- Integration secrets policy: {{xref:IXS-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Allowed storage backen... | spec         | Yes             |
| Environment scoping ru... | spec         | Yes             |
| Access control model (... | spec         | Yes             |
| Least privilege rule (... | spec         | Yes             |
| Audit logging rule for... | spec         | Yes             |
| Prohibited patterns (s... | spec         | Yes             |
| CI/CD secret handling ... | spec         | Yes             |
| Human access policy (w... | spec         | Yes             |
| Break-glass policy for... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Secret naming conventions | OPTIONAL

Rotation integration notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **No secrets in source control or build artifacts.**
- **Human access should be rare and audited.**
- **Break-glass must be time-bound and logged.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Storage Backends`
2. `## Environment Scoping`
3. `## Access Control`
4. `## Least Privilege`
5. `## Audit Logging`
6. `## CI/CD Handling`
7. `## Prohibited Patterns`
8. `## Break-Glass`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SKM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-03}}, {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL**
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
