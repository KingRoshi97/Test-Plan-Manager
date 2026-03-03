# IAM-01 — Identity Model Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-01                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring identity model spec       |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Identity Model Spec                       |

## 2. Purpose

Define the canonical internal role/permission model: role_ids, permission_ids, inheritance rules, default roles, and how roles/permissions are used for API and UI gating. This template must be consistent with AuthZ rules and claim-to-role mapping and must not invent role/permission IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- API-04 AuthZ Rules: `{{api.authz_rules}}`
- SSO-03 Claim → Role Mapping: `{{sso.claim_mapping}}` | OPTIONAL
- ADMIN-01 Admin Capabilities: `{{admin.capabilities}}` | OPTIONAL
- ROUTE-04 Guard Rules: `{{route.guard_rules}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Role registry (role_id list) | spec | No |
| Permission registry (perm_id list) | spec | No |
| Role definitions (purpose) | spec | No |
| Permission definitions (what allowed) | spec | No |
| Role → permission mapping | spec | No |
| Inheritance rules (role implies role/perm) | spec | Yes |
| Default role rule (new users) | spec | No |
| Tenant/organization scoping rules (if applicable) | spec | Yes |
| Admin/privileged role rules (step-up requirements ref) | spec | Yes |
| UI gating rules pointer (ROUTE-04) | spec | Yes |
| Telemetry requirements (authz denies by role/perm) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Fine-grained ABAC attributes model | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Least privilege: defaults must be minimal.
- No permission should exist without a description and a mapping context.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:API-04}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-04}}`, `{{xref:IAM-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define roles, permissions, and default role; do not invent IDs. |
| intermediate | Required. Define mappings and inheritance and privileged role list. |
| advanced | Required. Add scoping/ABAC model and strict traceability and telemetry fields. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, inherits, tenant scope rule, step up ref, telemetry fields, abac model, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `roles.list` is UNKNOWN → block Completeness Gate.
- If `perms.list` is UNKNOWN → block Completeness Gate.
- If `defaults.default_role_id` is UNKNOWN → block Completeness Gate.
- If `map` list is UNKNOWN → block Completeness Gate.
- If `telemetry.authz_deny_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] role_and_perm_registries_defined == true
  - [ ] role_perm_mapping_defined == true
  - [ ] default_and_privileged_roles_defined == true
  - [ ] telemetry_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

