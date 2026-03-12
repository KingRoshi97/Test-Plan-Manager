# IAM-03 — Session Management Policy (expiry, rotation, device binding)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-03                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring session management policy (expiry, rotation, device binding)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Session Management Policy (expiry, rotation, device binding) Document                         |

## 2. Purpose

Define the canonical session management policy: session artifacts (cookies/tokens), expiry
rules, refresh and rotation behavior, device binding, concurrent session rules, logout semantics,
and how session expiry is handled in UX. This template must align with SSO session exchange
rules and client token storage policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO session/token exchange: {{xref:SSO-04}} | OPTIONAL
- Token storage policy: {{xref:CSec-01}} | OPTIONAL
- Session expiry UX: {{xref:CER-04}} | OPTIONAL
- Auth methods: {{xref:IAM-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Session model (cookie/jwt/session_token/UNKNOWN)
Issued artifacts (access/refresh/session cookie)
Absolute TTL seconds
Idle TTL seconds (or NONE/UNKNOWN)
Refresh supported (yes/no/UNKNOWN)
Rotation supported (yes/no/UNKNOWN)
Device binding supported (yes/no/UNKNOWN)
Concurrent sessions policy (allow/limit)
Logout policy (local + global)
Revocation policy (invalidate sessions)
Telemetry requirements (session created/expired/refresh fail)
Security logging requirements (no tokens logged)

Optional Fields
Remembered device rule | OPTIONAL
Step-up reuse window | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Session expiry and refresh behavior must be deterministic and enforceable server-side.
Token storage must follow {{xref:CSec-01}}.
If refresh is supported, rotation rules must be explicit to limit token theft blast radius.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Session Model
model: {{session.model}}
issued: {{session.issued}}
storage_ref: {{session.storage_ref}} (expected: {{xref:CSec-01}}) | OPTIONAL
2. TTLs
absolute_ttl_seconds: {{ttl.absolute}}
idle_ttl_seconds: {{ttl.idle}}
3. Refresh
refresh_supported: {{refresh.supported}}
trigger_rule: {{refresh.trigger_rule}} | OPTIONAL
on_refresh_fail: {{refresh.on_fail}}
4. Rotation
rotation_supported: {{rotation.supported}}
rotation_rule: {{rotation.rule}} | OPTIONAL
5. Device Binding
device_binding_supported: {{device.supported}}
device_binding_rule: {{device.rule}} | OPTIONAL
6. Concurrency
policy: {{conc.policy}} (allow/limit/UNKNOWN)
max_sessions: {{conc.max_sessions}} | OPTIONAL
7. Logout & Revocation
local_logout_rule: {{logout.local_rule}}
global_logout_rule: {{logout.global_rule}} | OPTIONAL
revocation_rule: {{revoke.rule}}
8. UX Handling
expiry_ux_ref: {{xref:CER-04}} | OPTIONAL
re_auth_prompt_rule: {{ux.re_auth_prompt_rule}} | OPTIONAL
9. Telemetry
session_created_metric: {{telemetry.created_metric}}
session_expired_metric: {{telemetry.expired_metric}} | OPTIONAL
refresh_failure_metric: {{telemetry.refresh_fail_metric}} | OPTIONAL

10.Logging
no_token_logging_rule: {{logs.no_token_logging_rule}}
11.References
SSO session rules: {{xref:SSO-04}} | OPTIONAL
Auth methods: {{xref:IAM-02}} | OPTIONAL
Step-up rules: {{xref:SSO-07}} | OPTIONAL
Cross-References
Upstream: {{xref:IAM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IAM-06}}, {{xref:AUDIT-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define session model, TTLs, logout rule, and no-token-logging rule.
intermediate: Required. Define refresh/rotation and concurrency policy and telemetry.
advanced: Required. Add device binding, step-up reuse windows, and revocation rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, storage ref, refresh trigger, rotation rule,
device rule, max sessions, global logout, expiry prompt, optional telemetry metrics, remembered
device/step-up window, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If session.model is UNKNOWN → block Completeness Gate.
If ttl.absolute is UNKNOWN → block Completeness Gate.
If refresh.supported is UNKNOWN → block Completeness Gate.
If revoke.rule is UNKNOWN → block Completeness Gate.
If telemetry.created_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IAM
Pass conditions:
required_fields_present == true
session_model_and_ttls_defined == true
refresh_rotation_defined == true
logout_and_revocation_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IAM-04

IAM-04 — Authorization Enforcement Points (where checks happen)
Header Block

## 5. Optional Fields

Remembered device rule | OPTIONAL
Step-up reuse window | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Session expiry and refresh behavior must be deterministic and enforceable server-side.**
- **Token storage must follow {{xref:CSec-01}}.**
- If refresh is supported, rotation rules must be explicit to limit token theft blast radius.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Session Model`
2. `## TTLs`
3. `## Refresh`
4. `## Rotation`
5. `## Device Binding`
6. `## Concurrency`
7. `## Logout & Revocation`
8. `## UX Handling`
9. `## Telemetry`
10. `## Logging`

## 8. Cross-References

- **Upstream: {{xref:IAM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-06}}, {{xref:AUDIT-01}} | OPTIONAL**
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
