# ROUTE-04 — Guard Rules (auth gating, role gating)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-04                                             |
| Template Type     | Build / Routing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring guard rules (auth gating, role gating)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Guard Rules (auth gating, role gating) Document                         |

## 2. Purpose

Define the canonical client-side route guard rules: authentication gating, role/permission gating,
feature flag gating, and safe redirect behavior. This template must be consistent with backend
AuthZ policies and must not invent roles/permissions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- ROUTE-01 Route Contract: {{route.contract}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- CSec-01 Token Storage Policy: {{csec.token_policy}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Auth gating rules (log... | spec         | Yes             |
| Role/permission gating... | spec         | Yes             |
| Feature flag gating ru... | spec         | Yes             |
| Guard evaluation order... | spec         | Yes             |
| Redirect rules (where ... | spec         | Yes             |
| Return-to behavior (af... | spec         | Yes             |
| Forbidden handling (40... | spec         | Yes             |
| Session expiry handlin... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

ABAC-style client hints (org context) | OPTIONAL
Per-route custom guards | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Client guards MUST NOT be the only security control; server remains authoritative.
Do not invent roles/permissions; bind to {{xref:API-04}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Evaluation Order
order:
{{order[0]}}
{{order[1]}}
{{order[2]}} | OPTIONAL
2. Auth Gating
auth_required_rule: {{auth.required_rule}}
redirect_to_login: {{auth.redirect_to_login}}
return_to_param: {{auth.return_to_param}} | OPTIONAL
3. Role/Permission Gating
gating_model: {{roles.model}} (role/permission/UNKNOWN)
deny_behavior: {{roles.deny_behavior}} (403_route/404_hide/UNKNOWN)
required_claims_source: {{roles.claims_source}} | OPTIONAL
4. Feature Flag Gating
flag_gate_supported: {{flags.supported}}
flag_gate_rule: {{flags.rule}} | OPTIONAL
5. Redirect Rules
post_login_redirect: {{redirect.post_login}}
forbidden_redirect: {{redirect.forbidden_redirect}} | OPTIONAL
default_route: {{redirect.default_route}} | OPTIONAL
6. Session Expiry
session_expiry_ref: {{session.expiry_ref}} (expected: {{xref:CER-04}})
on_expiry_behavior: {{session.on_expiry_behavior}} | OPTIONAL
7. Telemetry
guard_denial_metric: {{telemetry.guard_denial_metric}}
guard_denial_log_fields: {{telemetry.guard_denial_log_fields}} | OPTIONAL
8. References
Route contract: {{xref:ROUTE-01}}
AuthZ rules: {{xref:API-04}} | OPTIONAL
Token storage: {{xref:CSec-01}} | OPTIONAL
Session expiry: {{xref:CER-04}} | OPTIONAL
Cross-References
Upstream: {{xref:ROUTE-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ROUTE-06}} | OPTIONAL

Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define auth gating + deny behavior; use UNKNOWN for flags/telemetry
details.
intermediate: Required. Define evaluation order, return-to behavior, and forbidden handling.
advanced: Required. Add per-route overrides and telemetry log fields with privacy constraints.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, return_to_param, claims_source, flag
gate rules, forbidden redirect, default route, expiry behavior, denial log fields, ABAC client hints,
per-route custom guards, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If auth.redirect_to_login is UNKNOWN → block Completeness Gate.
If roles.deny_behavior is UNKNOWN → block Completeness Gate.
If telemetry.guard_denial_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ROUTE
Pass conditions:
required_fields_present == true
auth_and_role_gating_defined == true
evaluation_order_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ROUTE-05

ROUTE-05 — Back/History Rules (expected behavior)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Client guards MUST NOT be the only security control; server remains authoritative.**
- Do not invent roles/permissions; bind to {{xref:API-04}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Evaluation Order`
2. `## order:`
3. `## Auth Gating`
4. `## Role/Permission Gating`
5. `## Feature Flag Gating`
6. `## Redirect Rules`
7. `## Session Expiry`
8. `## Telemetry`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:ROUTE-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ROUTE-06}} | OPTIONAL**
- **Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
