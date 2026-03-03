# IAM-03 — Access Policy Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-03                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring access policy spec        |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Access Policy Spec                        |

## 2. Purpose

Define the canonical session management policy: session artifacts (cookies/tokens), expiry rules, refresh and rotation behavior, device binding, concurrent session rules, logout semantics, and how session expiry is handled in UX. This template must align with SSO session exchange rules and client token storage policies.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- SSO session/token exchange: `{{xref:SSO-04}}` | OPTIONAL
- Token storage policy: `{{xref:CSec-01}}` | OPTIONAL
- Session expiry UX: `{{xref:CER-04}}` | OPTIONAL
- Auth methods: `{{xref:IAM-02}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Session model (cookie/jwt/session_token/UNKNOWN) | spec | No |
| Issued artifacts (access/refresh/session cookie) | spec | No |
| Absolute TTL seconds | spec | No |
| Idle TTL seconds (or NONE/UNKNOWN) | spec | Yes |
| Refresh supported (yes/no/UNKNOWN) | spec | No |
| Rotation supported (yes/no/UNKNOWN) | spec | No |
| Device binding supported (yes/no/UNKNOWN) | spec | Yes |
| Concurrent sessions policy (allow/limit) | spec | No |
| Logout policy (local + global) | spec | No |
| Revocation policy (invalidate sessions) | spec | No |
| Telemetry requirements (session created/expired/refresh fail) | spec | No |
| Security logging requirements (no tokens logged) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Remembered device rule | spec | OPTIONAL |
| Step-up reuse window | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Session expiry and refresh behavior must be deterministic and enforceable server-side.
- Token storage must follow `{{xref:CSec-01}}`.
- If refresh is supported, rotation rules must be explicit to limit token theft blast radius.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:IAM-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-06}}`, `{{xref:AUDIT-01}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define session model, TTLs, logout rule, and no-token-logging rule. |
| intermediate | Required. Define refresh/rotation and concurrency policy and telemetry. |
| advanced | Required. Add device binding, step-up reuse windows, and revocation rigor. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, storage ref, refresh trigger, rotation rule, device rule, max sessions, global logout, expiry prompt, optional telemetry metrics, remembered device/step-up window, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `session.model` is UNKNOWN → block Completeness Gate.
- If `ttl.absolute` is UNKNOWN → block Completeness Gate.
- If `refresh.supported` is UNKNOWN → block Completeness Gate.
- If `revoke.rule` is UNKNOWN → block Completeness Gate.
- If `telemetry.created_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] session_model_and_ttls_defined == true
  - [ ] refresh_rotation_defined == true
  - [ ] logout_and_revocation_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

