# IAM-05 — Service-to-Service Auth (mTLS/JWT, identity)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-05                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring service-to-service auth (mtls/jwt, identity)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Service-to-Service Auth (mTLS/JWT, identity) Document                         |

## 2. Purpose

Define the canonical service-to-service authentication model: how internal services identify each
other, what credentials are used (mTLS/JWT), how identities are issued/rotated, and how
requests are authorized between services. This template must be consistent with trust
boundaries and key/cert management rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security architecture (trust boundaries): {{xref:SEC-02}} | OPTIONAL
- Key types/usage: {{xref:SKM-04}} | OPTIONAL
- Certificate management: {{xref:SKM-06}} | OPTIONAL
- Network policy (allowlists): {{xref:IXS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Service identity model... | spec         | Yes             |
| Auth mechanism (mTLS/J... | spec         | Yes             |
| Where verification hap... | spec         | Yes             |
| Credential issuance mo... | spec         | Yes             |
| Rotation/renewal rules... | spec         | Yes             |
| Audience/scope rules f... | spec         | Yes             |
| Network allowlist poli... | spec         | Yes             |
| Authorization model fo... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Logging/redaction rule... | spec         | Yes             |

## 5. Optional Fields

SPIFFE/SPIRE usage notes | OPTIONAL

Break-glass for internal auth | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Internal auth must be verifiable and rotated; no long-lived static secrets.**
- **Fail closed on identity verification errors.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Service Identity`
2. `## Auth Mechanism`
3. `## Credential Issuance`
4. `## Rotation / Renewal`
5. `## JWT Rules (if applicable)`
6. `## Network Policy`
7. `## Authorization for Internal Calls`
8. `## Telemetry`
9. `## Logging`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SEC-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-03}}, {{xref:SEC-06}} | OPTIONAL**
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
