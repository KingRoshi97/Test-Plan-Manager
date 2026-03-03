# SKM-01 — Secrets Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-01                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring secrets inventory         |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-04, FMS-01, NOTIF-02, PAY-01                 |
| Produces          | Filled Secrets Inventory                         |

## 2. Purpose

Create the single, canonical inventory of secrets and keys used by the system, indexed by secret_id, including what each secret is for, where it is stored, who can access it, rotation requirements, and which components depend on it. This template must not include secret values.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets/credentials policy (integration): {{xref:IXS-04}} | OPTIONAL
- Payment providers: {{xref:PAY-01}} | OPTIONAL
- Notification providers: {{xref:NOTIF-02}} | OPTIONAL
- Storage providers: {{xref:FMS-01}} | OPTIONAL
- SSO providers: {{xref:SSO-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | UNKNOWN Allowed |
|---|---|
| Secrets registry (secret_id list) | No |
| secret_id (stable identifier) | No |
| Secret type (api_key/oauth_client_secret/jwt_signing_key/tls_cert/UNKNOWN) | Yes |
| Purpose/usage | No |
| Owning system/component | No |
| Storage location class (vault/env/kms/UNKNOWN) | Yes |
| Access policy (who can read) | No |
| Rotation required (yes/no/UNKNOWN) | No |
| Rotation interval (days) (or NONE/UNKNOWN) | Conditional |
| Dependencies (services/providers that use it) | Yes |
| Redaction/logging rule (never log) | No |
| Audit requirements (access to secret) | Yes |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Environment scoping (dev/stage/prod) | OPTIONAL |
| Expiry date (for certs) | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never include secret values or raw material.
- Every secret must have an owner and an access policy.
- If a secret is rotation_required, interval must be defined (or approved UNKNOWN with flag).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:IXS-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-02}}, {{xref:SKM-03}}, {{xref:SKM-09}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. List secrets and purposes and owners; no values. |
| Intermediate | Required. Add storage class, access policy, rotation rules. |
| Advanced | Required. Add dependencies mapping and audit/expiry rigor and env scoping. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, notes, env scope, expiry date, rotation interval if flagged, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If secrets[].secret_id is UNKNOWN → block Completeness Gate.
- If secrets[].owner_component is UNKNOWN → block Completeness Gate.
- If secrets[].access_policy is UNKNOWN → block Completeness Gate.
- If secrets[].logging_rule is UNKNOWN → block Completeness Gate.
- If secrets[*].rotation_required is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] secret_ids_unique == true
  - [ ] owners_and_access_policies_defined == true
  - [ ] rotation_rules_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

