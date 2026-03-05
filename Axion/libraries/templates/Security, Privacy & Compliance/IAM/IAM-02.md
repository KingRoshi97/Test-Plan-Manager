# IAM-02 — AuthN Methods (passwordless, SSO, MFA binding)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-02                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring authn methods (passwordless, sso, mfa binding)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled AuthN Methods (passwordless, SSO, MFA binding) Document                         |

## 2. Purpose

Define the canonical authentication methods supported by the product and how they are
enforced: password vs passwordless, SSO, MFA/step-up binding, and any device assurance
rules. This template must be consistent with SSO flow specs and client token storage rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO provider inventory: {{xref:SSO-01}} | OPTIONAL
- SSO flow spec: {{xref:SSO-02}} | OPTIONAL
- MFA/step-up rules: {{xref:SSO-07}} | OPTIONAL
- Token storage policy: {{xref:CSec-01}} | OPTIONAL
- Guard rules: {{xref:ROUTE-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Supported auth methods list (password/otp/webauthn/sso/UNKNOWN)
Primary method (default)
SSO supported (yes/no/UNKNOWN)
MFA supported (yes/no/UNKNOWN)
Step-up binding (what actions require step-up ref)
Credential policy (password rules if used)
Account recovery methods (email link, admin reset)
Device/session assurance notes (if any)
Auth method selection UX rules (what user sees)
Telemetry requirements (login success/fail by method)

Optional Fields
Rate limits/lockouts pointer | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
If password auth is enabled, password policy must be explicit.
If MFA/step-up is required for privileged actions, it must be enforceable server-side.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Supported Methods
methods: {{auth.methods}}
primary_method: {{auth.primary_method}}
2. SSO
sso_supported: {{sso.supported}}
providers: {{sso.providers}} | OPTIONAL
flow_ref: {{xref:SSO-02}} | OPTIONAL
3. MFA / Step-Up
mfa_supported: {{mfa.supported}}
step_up_ref: {{xref:SSO-07}} | OPTIONAL
4. Credential Policy
password_policy: {{creds.password_policy}} | OPTIONAL
passwordless_policy: {{creds.passwordless_policy}} | OPTIONAL
5. Recovery
recovery_methods: {{recovery.methods}}
recovery_security_rules: {{recovery.security_rules}} | OPTIONAL
6. UX Rules
selection_rule: {{ux.selection_rule}}
fallback_rule: {{ux.fallback_rule}} | OPTIONAL
7. Telemetry
login_success_metric: {{telemetry.login_success_metric}}
login_failure_metric: {{telemetry.login_failure_metric}} | OPTIONAL
breakdown_fields: {{telemetry.breakdown_fields}} | OPTIONAL
8. References
SSO inventory: {{xref:SSO-01}} | OPTIONAL
SSO flow: {{xref:SSO-02}} | OPTIONAL
MFA/step-up: {{xref:SSO-07}} | OPTIONAL
Session rules: {{xref:IAM-03}} | OPTIONAL
Lockouts: {{xref:SSO-08}} | OPTIONAL
Cross-References
Upstream: {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:IAM-03}}, {{xref:IAM-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define supported methods, primary method, and recovery methods.
intermediate: Required. Define SSO/MFA flags and credential policy and telemetry.
advanced: Required. Add device assurance and UX selection/fallback rigor and server
enforcement notes.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, providers list, password policies,
passwordless policy, recovery security rules, fallback rule, telemetry breakdown fields, rate limits
pointer, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If auth.methods is UNKNOWN → block Completeness Gate.
If auth.primary_method is UNKNOWN → block Completeness Gate.
If recovery.methods is UNKNOWN → block Completeness Gate.
If telemetry.login_success_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IAM
Pass conditions:
required_fields_present == true
methods_defined == true
recovery_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IAM-03

IAM-03 — Session Management Policy (expiry, rotation, device binding)
Header Block

## 5. Optional Fields

Rate limits/lockouts pointer | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- If password auth is enabled, password policy must be explicit.
- If MFA/step-up is required for privileged actions, it must be enforceable server-side.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Supported Methods`
2. `## SSO`
3. `## MFA / Step-Up`
4. `## Credential Policy`
5. `## Recovery`
6. `## UX Rules`
7. `## Telemetry`
8. `## References`

## 8. Cross-References

- **Upstream: {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-03}}, {{xref:IAM-06}} | OPTIONAL**
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
