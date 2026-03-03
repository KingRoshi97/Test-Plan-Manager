# SKM-05 — Secret Injection Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-05                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring secret injection spec     |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-02, SKM-04, SEC-02                           |
| Produces          | Filled Secret Injection Spec                     |

## 2. Purpose

Define the canonical strategy for cryptographic key management using KMS and/or HSM: which provider(s) are used, what keys live where, boundary responsibilities, and how access/rotation/audit work at this layer. This template must align with storage/access policy and security architecture trust boundaries.

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

| Field Name | UNKNOWN Allowed |
|---|---|
| KMS/HSM provider(s) list (provider_id) | No |
| Key classes that MUST use KMS/HSM | No |
| Boundary statement (what KMS/HSM protects) | No |
| Responsibilities split (app vs provider) | Yes |
| Access control model (service identities, IAM policies) | No |
| Audit logging for KMS usage | No |
| Rotation integration rule (SKM-03) | Yes |
| Backup/DR rule (key availability) | No |
| Telemetry requirements (KMS errors, throttling, latency) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| HSM requirement (true/false/UNKNOWN) | OPTIONAL |
| Bring-your-own-key policy | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Master keys should not be exportable unless explicitly allowed.
- KMS policies must follow least privilege and be environment-scoped.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-06}}, {{xref:SKM-10}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define providers, boundary statement, and required key classes. |
| Intermediate | Required. Define access policy model, DR availability, and telemetry. |
| Advanced | Required. Add HSM/BYOK notes and stricter audit/rotation integration rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, provider responsibilities, service identity rule, audit events, rotation integration, restore rule, optional telemetry, hsm/byok, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If kms.providers is UNKNOWN → block Completeness Gate.
- If kms.required_key_classes is UNKNOWN → block Completeness Gate.
- If kms.boundary_statement is UNKNOWN → block Completeness Gate.
- If dr.availability_rule is UNKNOWN → block Completeness Gate.
- If telemetry.kms_error_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] providers_and_boundaries_defined == true
  - [ ] key_classes_defined == true
  - [ ] access_and_dr_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

