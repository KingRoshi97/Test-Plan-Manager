# SKM-06 — Certificate Management (issuance, renewal, revocation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-06                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring certificate management (issuance, renewal, revocation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Certificate Management (issuance, renewal, revocation) Document                         |

## 2. Purpose

Define the canonical lifecycle for certificates (TLS/mTLS): issuance, renewal, rotation,
revocation, and monitoring. This template must align with service-to-service auth and rotation
policies and ensure cert expiry does not cause outages.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Rotation policy: {{xref:SKM-03}} | OPTIONAL
- Service-to-service auth: {{xref:IAM-05}} | OPTIONAL
- Vulnerability management: {{xref:SEC-04}} | OPTIONAL
- Integration inventory (providers): {{xref:IXS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Certificate types list... | spec         | Yes             |
| Issuance model (ACME/C... | spec         | Yes             |
| Certificate authority/... | spec         | Yes             |
| Renewal cadence (days ... | spec         | Yes             |
| Rotation/overlap rules... | spec         | Yes             |
| Revocation rules (when... | spec         | Yes             |
| Distribution mechanism... | spec         | Yes             |
| Monitoring/alerts (exp... | spec         | Yes             |
| Audit requirements (is... | spec         | Yes             |

## 5. Optional Fields

SAN naming conventions | OPTIONAL

Certificate pinning notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Certificates must be rotated before expiry with clear monitoring.**
- **Revocation must be runnable during incidents.**
- **Private keys must never be logged or stored insecurely.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Types`
2. `## Issuance`
3. `## Renewal`
4. `## Rotation / Overlap`
5. `## Revocation`
6. `## Distribution`
7. `## Monitoring`
8. `## Audit`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SKM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL**
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
