# SSO-07 — MFA/Step-Up Auth Rules (when required)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-07                                             |
| Template Type     | Integration / SSO & Identity                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring mfa/step-up auth rules (when required)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled MFA/Step-Up Auth Rules (when required) Document                         |

## 2. Purpose

Define the canonical MFA and step-up authentication rules: what triggers step-up, what
assurance levels are required for sensitive actions, how the client/server enforce it, and what
the user experience is when step-up is required. This template must be consistent with AuthZ
rules and admin capability risk levels and must not invent roles/actions not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Admin Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

MFA supported (yes/no/UNKNOWN)
Assurance level model (AAL/LOA/UNKNOWN)
Step-up triggers (actions, risk level, location)
Per-action requirement map (capability/action → required level)
How step-up is enforced (server-side gate)
How step-up is requested (redirect/challenge)
Session binding for step-up (duration, re-use window)
Failure handling (deny, retry, lockout)
Telemetry requirements (step-up challenged, success/fail)

Optional Fields
Remembered device policy | OPTIONAL
Risk engine inputs | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Step-up MUST be enforced server-side for privileged actions.
Do not rely on client-only checks for MFA/assurance enforcement.
If MFA is not supported, privileged actions requiring step-up MUST be blocked or redesigned.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. MFA Support
mfa_supported: {{mfa.supported}}
providers_supporting_mfa: {{mfa.providers_supporting_mfa}} | OPTIONAL
2. Assurance Model
model: {{assurance.model}} (AAL/LOA/UNKNOWN)
levels: {{assurance.levels}} | OPTIONAL
3. Step-Up Triggers
triggers: {{stepup.triggers}}
risk_level_binding: {{stepup.risk_level_binding}} | OPTIONAL
4. Per-Action Requirements
Requirement
action_id: {{reqs[0].action_id}}
action_ref: {{reqs[0].action_ref}} (e.g., {{xref:ADMIN-01}} capability_id) | OPTIONAL
required_assurance_level: {{reqs[0].required_level}}
notes: {{reqs[0].notes}} | OPTIONAL
(Repeat per action.)
5. Enforcement
server_enforced: {{enforce.server_enforced}}
enforcement_point: {{enforce.point}} (middleware/endpoint/UNKNOWN)
deny_on_insufficient_assurance: {{enforce.deny_rule}}
6. Step-Up Request Flow
request_method: {{flow.request_method}} (redirect/challenge/UNKNOWN)
return_to_rule: {{flow.return_to_rule}} | OPTIONAL
max_challenge_attempts: {{flow.max_attempts}} | OPTIONAL
7. Step-Up Session Binding
reuse_window_seconds: {{session.reuse_window_seconds}}
reauth_required_after: {{session.reauth_required_after}} | OPTIONAL

8. Failure Handling
on_fail_behavior: {{fail.on_fail_behavior}}
lockout_policy: {{fail.lockout_policy}} | OPTIONAL
9. Telemetry
challenge_shown_metric: {{telemetry.challenge_shown_metric}}
challenge_success_metric: {{telemetry.challenge_success_metric}} | OPTIONAL
challenge_fail_metric: {{telemetry.challenge_fail_metric}} | OPTIONAL
10.References
Flow spec: {{xref:SSO-02}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Admin capabilities/risk: {{xref:ADMIN-01}} | OPTIONAL
Guard rules: {{xref:ROUTE-04}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL
Cross-References
Upstream: {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define whether MFA supported and a trigger list; do not invent action ids.
intermediate: Required. Define per-action map and server enforcement points.
advanced: Required. Add risk engine inputs, remembered device policy, and strict telemetry.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, providers supporting mfa, assurance
levels, risk bindings, action refs/notes, enforcement point, return-to rule, max attempts, reauth
after, lockout policy, optional metrics, remembered device/risk engine, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If mfa.supported is UNKNOWN → block Completeness Gate.
If enforce.server_enforced is UNKNOWN → block Completeness Gate.
If enforce.deny_rule is UNKNOWN → block Completeness Gate.
If telemetry.challenge_shown_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
mfa_support_defined == true
per_action_requirements_defined == true
server_enforcement_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SSO-08

SSO-08 — Failure Handling (lockouts, partial provision, retries)
Header Block

## 5. Optional Fields

Remembered device policy | OPTIONAL
Risk engine inputs | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Step-up MUST be enforced server-side for privileged actions.**
- Do not rely on client-only checks for MFA/assurance enforcement.
- If MFA is not supported, privileged actions requiring step-up MUST be blocked or redesigned.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## MFA Support`
2. `## Assurance Model`
3. `## Step-Up Triggers`
4. `## Per-Action Requirements`
5. `## Requirement`
6. `## (Repeat per action.)`
7. `## Enforcement`
8. `## Step-Up Request Flow`
9. `## Step-Up Session Binding`
10. `## Failure Handling`

## 8. Cross-References

- **Upstream: {{xref:SSO-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SSO-10}} | OPTIONAL**
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
