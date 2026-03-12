# SSO-03 — Claim Mapping & Role Provisioning (claims → roles/permissions)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-03                                             |
| Template Type     | Integration / SSO & Identity                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring claim mapping & role provisioning (claims → roles/permissions)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Claim Mapping & Role Provisioning (claims → roles/permissions) Document                         |

## 2. Purpose

Define the canonical mapping from identity provider claims/attributes to internal
roles/permissions, including provisioning rules, default roles, group mappings, and handling of
missing/invalid claims. This template must be consistent with AuthZ rules and must not invent
roles/permissions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}} | OPTIONAL
- API-04 AuthZ Rules (roles/claims): {{api.authz_rules}}
- ROUTE-04 Guard Rules (client gating): {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

provider_id binding
claim sources (id_token / saml attributes / userinfo)
required claim list (must exist)
claim normalization rules (case, arrays, delims)
role mapping rules (claim → role_id)
permission mapping rules (claim → permission/claim)
default role rule (if mapping missing)
group mapping rules (IdP groups → internal groups)
provisioning behavior (create user? update roles?)
deprovisioning behavior (disable user?)
error handling (missing/invalid claims)
audit/telemetry requirements (role assignment events)

Optional Fields
Multi-tenant org mapping | OPTIONAL
Just-in-time provisioning notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Do not invent role_ids/permissions; bind only to {{xref:API-04}}.
Never grant elevated roles by default unless explicitly required.
Missing required claims MUST cause a safe failure or safe default (least privilege).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Claim Sources
provider_id: {{meta.provider_id}}
sources: {{claims.sources}}
required_claims: {{claims.required}}
optional_claims: {{claims.optional}} | OPTIONAL
2. Normalization Rules
normalize_rule: {{normalize.rule}}
group_parse_rule: {{normalize.group_parse_rule}} | OPTIONAL
3. Role Mapping
Mapping
claim_key: {{roles.map[0].claim_key}}
match: {{roles.map[0].match}}
assign_role_id: {{roles.map[0].assign_role_id}}
notes: {{roles.map[0].notes}} | OPTIONAL
(Repeat per mapping.)
4. Permission / Entitlement Mapping
Mapping
claim_key: {{perms.map[0].claim_key}}
match: {{perms.map[0].match}}
assign_permissions: {{perms.map[0].assign_permissions}}
notes: {{perms.map[0].notes}} | OPTIONAL
(Repeat per mapping.)
5. Defaulting / Fallback
default_role_id: {{defaults.default_role_id}}
when_default_applies: {{defaults.when_default_applies}}
deny_on_missing_required_claims: {{defaults.deny_on_missing_required_claims}}

6. Group Mapping
group_mapping_supported: {{groups.supported}}
idp_group_key: {{groups.idp_group_key}} | OPTIONAL
map: {{groups.map}} | OPTIONAL
7. Provisioning / Deprovisioning
jit_create_user: {{prov.jit_create_user}}
update_roles_on_login: {{prov.update_roles_on_login}} | OPTIONAL
deprovision_rule: {{prov.deprovision_rule}}
8. Error Handling
missing_claim_behavior: {{errors.missing_claim_behavior}}
invalid_claim_behavior: {{errors.invalid_claim_behavior}} | OPTIONAL
9. Audit / Telemetry
role_assignment_metric: {{telemetry.role_assignment_metric}}
deprovision_metric: {{telemetry.deprovision_metric}} | OPTIONAL
audit_fields: {{telemetry.audit_fields}} | OPTIONAL
10.References
AuthZ rules: {{xref:API-04}}
Flow spec: {{xref:SSO-02}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL
Audit/compliance: {{xref:SSO-10}} | OPTIONAL
Client guards: {{xref:ROUTE-04}} | OPTIONAL
Cross-References
Upstream: {{xref:SSO-01}}, {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-04}}, {{xref:SSO-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define required claims and default role rule; do not invent roles.
intermediate: Required. Define role/permission maps and provisioning behavior.
advanced: Required. Add multi-tenant org mapping and strict audit/telemetry fields.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional claims, parse rules, mapping
notes, group keys/maps, update roles on login, invalid claim behavior, optional metrics/audit
fields, org mapping, jit notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If claims.required is UNKNOWN → block Completeness Gate.
If defaults.default_role_id is UNKNOWN → block Completeness Gate.
If defaults.deny_on_missing_required_claims is UNKNOWN → block Completeness Gate.
If telemetry.role_assignment_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SSO

Pass conditions:
required_fields_present == true
provider_id_exists_in_SSO_01 == true
all role_ids/permissions exist in API-04
least_privilege_defaults_defined == true
audit_and_telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SSO-04

SSO-04 — Session & Token Exchange Rules (refresh, expiry, rotation)
Header Block

## 5. Optional Fields

Multi-tenant org mapping | OPTIONAL
Just-in-time provisioning notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not invent role_ids/permissions; bind only to {{xref:API-04}}.
- **Never grant elevated roles by default unless explicitly required.**
- **Missing required claims MUST cause a safe failure or safe default (least privilege).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Claim Sources`
2. `## Normalization Rules`
3. `## Role Mapping`
4. `## Mapping`
5. `## (Repeat per mapping.)`
6. `## Permission / Entitlement Mapping`
7. `## Mapping`
8. `## (Repeat per mapping.)`
9. `## Defaulting / Fallback`
10. `## Group Mapping`

## 8. Cross-References

- **Upstream: {{xref:SSO-01}}, {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SSO-04}}, {{xref:SSO-05}} | OPTIONAL**
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
