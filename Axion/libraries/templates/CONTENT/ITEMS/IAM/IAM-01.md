# IAM-01 — Role & Permission Model (roles, permissions, inheritance)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-01                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring role & permission model (roles, permissions, inheritance)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Role & Permission Model (roles, permissions, inheritance) Document                         |

## 2. Purpose

Define the canonical internal role/permission model: role_ids, permission_ids, inheritance rules,
default roles, and how roles/permissions are used for API and UI gating. This template must be
consistent with AuthZ rules and claim-to-role mapping and must not invent role/permission IDs
beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}}
- SSO-03 Claim → Role Mapping: {{sso.claim_mapping}} | OPTIONAL
- ADMIN-01 Admin Capabilities: {{admin.capabilities}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Role registry (role_id list)
Permission registry (perm_id list)
Role definitions (purpose)
Permission definitions (what allowed)
Role → permission mapping
Inheritance rules (role implies role/perm)
Default role rule (new users)
Tenant/organization scoping rules (if applicable)
Admin/privileged role rules (step-up requirements ref)
UI gating rules pointer (ROUTE-04)
Telemetry requirements (authz denies by role/perm)

Optional Fields
Fine-grained ABAC attributes model | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Least privilege: defaults must be minimal.
No permission should exist without a description and a mapping context.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Roles
roles: {{roles.list}}
2. Permissions
permissions: {{perms.list}}
3. Role Definitions (repeat)
Role
role_id: {{roles.items[0].role_id}}
name: {{roles.items[0].name}}
purpose: {{roles.items[0].purpose}}
inherits: {{roles.items[0].inherits}} | OPTIONAL
(Repeat per role.)
4. Permission Definitions (repeat)
Permission
perm_id: {{perms.items[0].perm_id}}
name: {{perms.items[0].name}}
description: {{perms.items[0].description}}
(Repeat per permission.)
5. Role → Permission Mapping
Mapping
role_id: {{map[0].role_id}}
perm_ids: {{map[0].perm_ids}}
(Repeat per role.)
6. Defaults & Scoping
default_role_id: {{defaults.default_role_id}}
tenant_scope_rule: {{scope.tenant_scope_rule}} | OPTIONAL
7. Privileged Roles
privileged_roles: {{priv.roles}}
step_up_ref: {{priv.step_up_ref}} (expected: {{xref:SSO-07}}) | OPTIONAL

8. UI Gating
route_guard_ref: {{xref:ROUTE-04}} | OPTIONAL
9. Telemetry
authz_deny_metric: {{telemetry.authz_deny_metric}}
fields: {{telemetry.fields}} | OPTIONAL
10.References
AuthZ rules: {{xref:API-04}}
Claim mapping: {{xref:SSO-03}} | OPTIONAL
Admin capabilities: {{xref:ADMIN-01}} | OPTIONAL
Step-up rules: {{xref:SSO-07}} | OPTIONAL
Cross-References
Upstream: {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IAM-04}}, {{xref:IAM-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define roles, permissions, and default role; do not invent IDs.
intermediate: Required. Define mappings and inheritance and privileged role list.
advanced: Required. Add scoping/ABAC model and strict traceability and telemetry fields.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, inherits, tenant scope rule, step up ref,
telemetry fields, abac model, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If roles.list is UNKNOWN → block Completeness Gate.
If perms.list is UNKNOWN → block Completeness Gate.
If defaults.default_role_id is UNKNOWN → block Completeness Gate.
If map list is UNKNOWN → block Completeness Gate.
If telemetry.authz_deny_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IAM
Pass conditions:
required_fields_present == true
role_and_perm_registries_defined == true
role_perm_mapping_defined == true
default_and_privileged_roles_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IAM-02

IAM-02 — AuthN Methods (passwordless, SSO, MFA binding)
Header Block

## 5. Optional Fields

Fine-grained ABAC attributes model | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Least privilege: defaults must be minimal.**
- **No permission should exist without a description and a mapping context.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Roles`
2. `## Permissions`
3. `## Role Definitions (repeat)`
4. `## Role`
5. `## (Repeat per role.)`
6. `## Permission Definitions (repeat)`
7. `## Permission`
8. `## (Repeat per permission.)`
9. `## Role → Permission Mapping`
10. `## Mapping`

## 8. Cross-References

- **Upstream: {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IAM-04}}, {{xref:IAM-10}} | OPTIONAL**
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
