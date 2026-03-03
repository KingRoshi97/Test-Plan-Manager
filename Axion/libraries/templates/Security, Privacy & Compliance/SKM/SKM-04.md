# SKM-04 — Access Control for Secrets

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-04                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring access control for secret |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-01, SEC-02, SKM-05                           |
| Produces          | Filled Access Control for Secrets                |

## 2. Purpose

Define the canonical taxonomy of keys and how they are used across the system: signing keys, encryption keys, API keys, TLS certs, and token secrets. This template establishes consistent rules for key purpose separation, algorithm choices, and where keys are stored/used.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- KMS/HSM strategy: {{xref:SKM-05}} | OPTIONAL
- File security: {{xref:FMS-06}} | OPTIONAL
- Payments security/PCI: {{xref:PAY-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Key type registry (key_type list) | No |
| Purpose separation rules (signing vs encryption) | No |
| Allowed algorithms list (or UNKNOWN) | No |
| Key storage backend rule (KMS/HSM/vault) | No |
| Key usage contexts (JWT signing, envelope encryption, TLS) | No |
| Key access model (service identities) | No |
| Key rotation linkage (SKM-03) | Yes |
| Key lifecycle states (active/retiring/retired) | No |
| Telemetry requirements (key usage errors, nearing expiry) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Key derivation rules | OPTIONAL |
| Key identifiers naming conventions | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not reuse the same key for multiple purposes.
- Key types must have explicit allowed usage contexts.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-06}}, {{xref:SKM-10}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define key types, purpose separation, and storage rule. |
| Intermediate | Required. Define allowed algorithms and usage contexts and lifecycle states. |
| Advanced | Required. Add derivation/naming conventions and tight rotation/lifecycle transition rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, kms ref, rotation rules, transition rule, optional telemetry, derivation/naming, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If types.list is UNKNOWN → block Completeness Gate.
- If purpose.rules is UNKNOWN → block Completeness Gate.
- If algorithms.allowed is UNKNOWN → block Completeness Gate.
- If storage.rule is UNKNOWN → block Completeness Gate.
- If telemetry.key_usage_error_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] key_types_and_usage_defined == true
  - [ ] purpose_separation_defined == true
  - [ ] storage_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

