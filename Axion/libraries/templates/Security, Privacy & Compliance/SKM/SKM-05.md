# SKM-05 — KMS/HSM Strategy (providers, boundaries, responsibilities)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-05                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring kms/hsm strategy (providers, boundaries, responsibilities)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled KMS/HSM Strategy (providers, boundaries, responsibilities) Document                         |

## 2. Purpose

Define the canonical strategy for cryptographic key management using KMS and/or HSM: which
provider(s) are used, what keys live where, boundary responsibilities, and how
access/rotation/audit work at this layer. This template must align with storage/access policy and
security architecture trust boundaries.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Key types/usage: {{xref:SKM-04}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Integration inventory (providers): {{xref:IXS-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| KMS/HSM provider(s) li... | spec         | Yes             |
| Boundary statement (wh... | spec         | Yes             |
| Responsibilities split... | spec         | Yes             |
| Access control model (... | spec         | Yes             |
| Audit logging for KMS ... | spec         | Yes             |
| Rotation integration r... | spec         | Yes             |
| Backup/DR rule (key av... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

HSM requirement (true/false/UNKNOWN) | OPTIONAL

Bring-your-own-key policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Master keys should not be exportable unless explicitly allowed.**
- **KMS policies must follow least privilege and be environment-scoped.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Providers`
2. `## Key Classes in KMS/HSM`
3. `## Boundary`
4. `## Responsibilities`
5. `## Access Control`
6. `## Audit`
7. `## Rotation`
8. `## Backup / DR`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SKM-06}}, {{xref:SKM-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define providers, boundary statement, and required key classes.**
- **intermediate: Required. Define access policy model, DR availability, and telemetry.**
- **advanced: Required. Add HSM/BYOK notes and stricter audit/rotation integration rigor.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, provider responsibilities, service identity**
- rule, audit events, rotation integration, restore rule, optional telemetry, hsm/byok,
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If kms.providers is UNKNOWN → block

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
