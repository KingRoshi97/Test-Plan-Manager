# SKM-02 — Secret Storage Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-02                                           |
| Template Type     | Security / Secrets                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring secret storage spec       |
| Filled By         | Internal Agent                                   |
| Consumes          | SKM-01, SEC-03, IAM-05                           |
| Produces          | Filled Secret Storage Spec                       |

## 2. Purpose

Define the canonical policy for where secrets are stored and how access is controlled: vault/KMS usage, environment scoping, least privilege, auditability, and prohibited patterns. This template must align with secrets inventory and baseline security controls.

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

| Field Name | UNKNOWN Allowed |
|---|---|
| Allowed storage backends (vault/kms/env/UNKNOWN) | Yes |
| Environment scoping rule (dev/stage/prod separation) | No |
| Access control model (role-based, service identity) | No |
| Least privilege rule (per secret) | No |
| Audit logging rule for secret reads/writes | No |
| Prohibited patterns (secrets in code/logs/images) | No |
| CI/CD secret handling rules (inject, mask) | No |
| Human access policy (who can view) | No |
| Break-glass policy for secrets access | No |
| Telemetry requirements (secret access spikes, failures) | No |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Secret naming conventions | OPTIONAL |
| Rotation integration notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- No secrets in source control or build artifacts.
- Human access should be rare and audited.
- Break-glass must be time-bound and logged.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: {{xref:SKM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SKM-03}}, {{xref:SKM-08}}, {{xref:SKM-10}} | OPTIONAL
- **Standards**: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| Beginner | Required. Define allowed backends, env separation, and prohibited patterns. |
| Intermediate | Required. Define audit events, CI rules, and human access policy. |
| Advanced | Required. Add per-secret least privilege rules and break-glass rigor and telemetry fields. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, primary backend, cross-env allowed, service identity rule, per-secret rule, audit fields, rotation in CI, max duration, optional telemetry, naming/rotation notes, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If store.allowed_backends is UNKNOWN → block Completeness Gate.
- If env.separation_rule is UNKNOWN → block Completeness Gate.
- If access.human_access_rule is UNKNOWN → block Completeness Gate.
- If ci.masking_rule is UNKNOWN → block Completeness Gate.
- If ban.list is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SKM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] storage_and_env_scoping_defined == true
  - [ ] access_and_audit_defined == true
  - [ ] ci_and_prohibited_patterns_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

