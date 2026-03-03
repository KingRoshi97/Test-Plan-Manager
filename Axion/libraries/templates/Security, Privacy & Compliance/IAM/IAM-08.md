# IAM-08 — IAM Integration Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-08                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring iam integration spec      |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled IAM Integration Spec                      |

## 2. Purpose

Define the canonical policy for API keys: how keys are created, scoped, stored, rotated, revoked, and audited. This template must be consistent with AuthZ rules and secrets storage policies and must not invent key capabilities beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- API surface: `{{xref:API-01}}` | OPTIONAL
- AuthZ rules: `{{xref:API-04}}` | OPTIONAL
- Secrets storage policy: `{{xref:SKM-02}}` | OPTIONAL
- Audit event catalog: `{{xref:AUDIT-01}}` | OPTIONAL
- Privileged API catalog: `{{xref:ADMIN-05}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| API key types supported (user key/service key/UNKNOWN) | spec | No |
| Key format rule (prefix, length, hashing) | spec | No |
| Creation rules (who can create) | spec | No |
| Scope model (perm scopes, endpoint scopes) | spec | No |
| Default scope rule (least privilege) | spec | No |
| Storage rule (hashed at rest) | spec | No |
| Rotation policy (intervals, triggers) | spec | No |
| Revocation policy (immediate, propagate) | spec | No |
| Usage logging rules (what is logged) | spec | No |
| Rate limits for key usage (RLIM refs) | spec | Yes |
| Telemetry requirements (key auth success/fail, revoked usage) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Key expiration support | spec | OPTIONAL |
| Key allowlist/denylist policy | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Keys must never be stored in plaintext; store hashes only.
- Scopes must be least-privilege and enforceable at authorization points.
- Key creation/rotation/revocation must be auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:API-04}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-10}}`, `{{xref:AUDIT-01}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define key types, hashing rule, scope model, and revoke rule. |
| intermediate | Required. Define rotation and logging fields and telemetry. |
| advanced | Required. Add expiration/allowlist controls and strict propagation/rate-limit linkage. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, creation surface, examples, storage ref, interval/triggers, propagation, rate limit ref, optional metrics, expiration/allowlist, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `keys.format_rule` is UNKNOWN → block Completeness Gate.
- If `keys.hashing_rule` is UNKNOWN → block Completeness Gate.
- If `scope.model` is UNKNOWN → block Completeness Gate.
- If `revoke.rule` is UNKNOWN → block Completeness Gate.
- If `telemetry.auth_success_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] format_and_hashing_defined == true
  - [ ] scoping_defined == true
  - [ ] rotation_and_revocation_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

