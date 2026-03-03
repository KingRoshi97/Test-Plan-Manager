# IAM-02 — Role & Permission Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-02                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring role & permission catalog |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Role & Permission Catalog                 |

## 2. Purpose

Define the canonical authentication methods supported by the product and how they are enforced: password vs passwordless, SSO, MFA/step-up binding, and any device assurance rules. This template must be consistent with SSO flow specs and client token storage rules.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- SSO provider inventory: `{{xref:SSO-01}}` | OPTIONAL
- SSO flow spec: `{{xref:SSO-02}}` | OPTIONAL
- MFA/step-up rules: `{{xref:SSO-07}}` | OPTIONAL
- Token storage policy: `{{xref:CSec-01}}` | OPTIONAL
- Guard rules: `{{xref:ROUTE-04}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Supported auth methods list (password/otp/webauthn/sso/UNKNOWN) | spec | No |
| Primary method (default) | spec | No |
| SSO supported (yes/no/UNKNOWN) | spec | No |
| MFA supported (yes/no/UNKNOWN) | spec | No |
| Step-up binding (what actions require step-up ref) | spec | Yes |
| Credential policy (password rules if used) | spec | Yes |
| Account recovery methods (email link, admin reset) | spec | No |
| Device/session assurance notes (if any) | spec | Yes |
| Auth method selection UX rules (what user sees) | spec | No |
| Telemetry requirements (login success/fail by method) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Rate limits/lockouts pointer | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- If password auth is enabled, password policy must be explicit.
- If MFA/step-up is required for privileged actions, it must be enforceable server-side.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:SSO-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-03}}`, `{{xref:IAM-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define supported methods, primary method, and recovery methods. |
| intermediate | Required. Define SSO/MFA flags and credential policy and telemetry. |
| advanced | Required. Add device assurance and UX selection/fallback rigor and server enforcement notes. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, providers list, password policies, passwordless policy, recovery security rules, fallback rule, telemetry breakdown fields, rate limits pointer, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `auth.methods` is UNKNOWN → block Completeness Gate.
- If `auth.primary_method` is UNKNOWN → block Completeness Gate.
- If `recovery.methods` is UNKNOWN → block Completeness Gate.
- If `telemetry.login_success_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] methods_defined == true
  - [ ] recovery_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

