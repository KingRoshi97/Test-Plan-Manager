# API-04 — AuthZ Rules (RBAC/ABAC checks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-04                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with protected API endpoints          |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, API-01, API-02, API-03, SEC-01, SEC-02, ADMIN-05 |
| Produces          | Filled AuthZ Rules Document                        |

## 2. Purpose

Define the single, canonical authorization model for the application API surface: what roles/permissions exist (RBAC), what contextual constraints apply (ABAC), how endpoint specs reference these rules, and how denials are handled. This document must not invent roles, permissions, or scopes that are not present in upstream inputs; any missing required elements must be marked UNKNOWN.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- API-01: `{{api.endpoint_catalog}}`
- API-02: `{{api.endpoint_specs}}`
- API-03: `{{api.error_policy}}`
- SEC-01: `{{sec.authn}}`
- SEC-02: `{{sec.authz_inputs}}` | OPTIONAL
- ADMIN-05: `{{admin.privileged_surface}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| AuthZ model statement               | spec         | No              |
| Principal model                     | spec         | No              |
| Resource scope model                | spec         | No              |
| Roles registry                      | spec         | No              |
| Permissions registry                | spec         | No              |
| Role → permission mapping           | spec         | No              |
| ABAC conditions library             | spec         | No              |
| Endpoint AuthZ binding rules        | spec         | No              |
| Deny behavior policy                | spec         | No              |
| Admin override policy               | spec         | Yes             |
| Audit/evidence requirements         | spec         | No              |
| Verification requirements           | spec         | No              |

## 5. Optional Fields

| Field Name                          | Source | Notes                          |
|-------------------------------------|--------|--------------------------------|
| Service-to-service authz rules      | spec   | Only if applicable             |
| Impersonation rules                 | spec   | Only if applicable             |
| Break-glass / emergency access      | spec   | Only if applicable             |
| Two-person approval policy          | spec   | High-risk actions only         |
| Row-level security notes            | spec   | DB-level enforcement           |
| WebSocket/RPC authz mapping         | spec   | Non-HTTP transports            |

## 6. Rules

- Do not introduce new role IDs or permission IDs; use only what exists in upstream inputs.
- Every endpoint spec (API-02) MUST reference AuthZ using the binding format defined here.
- ABAC rules MUST be deterministic and evaluable from available principal/resource/context fields.
- Tenant isolation is a hard rule: cross-tenant access MUST be denied unless explicitly defined.
- If deny behavior uses concealment (404), the concealment rule MUST be stable per resource type.
- All privileged actions MUST emit audit evidence per this doc.

## 7. Output Format

### Required Headings (in order)

1. `## AuthZ Model` — model statement, decision rule (ALLOW iff RBAC AND ABAC)
2. `## Principal Model` — identity/claims fields for decisions
3. `## Resource Scope Model` — org/project/env/ownership boundaries
4. `## Roles Registry` — role IDs, names, summaries
5. `## Permissions Registry` — permission IDs, names, summaries
6. `## Role → Permission Matrix` — RBAC mapping
7. `## ABAC Conditions Library` — named conditions with inputs, rules, deny reason codes
8. `## Endpoint AuthZ Binding` — canonical authz block format for API-02
9. `## Deny Behavior Policy` — 403 vs 404 concealment rules
10. `## Admin Override Policy` — override permissions, audit, environments
11. `## Audit & Evidence Requirements` — required log fields for privileged actions
12. `## Verification Requirements` — minimum test requirements per endpoint class

## 8. Cross-References

- **Upstream**: SPEC_INDEX, API-01, API-02, SEC-01, STANDARDS_INDEX
- **Downstream**: ADMIN-01, ADMIN-05, QA-02, QA-03
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-SECURITY

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Fill with UNKNOWN where needed       | Required  | Required     | Required |
| Roles/permissions from inputs + ABAC | Optional  | Required     | Required |
| Endpoint binding + audit rigor       | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: sec.authz_inputs, admin.override.*, impersonation_rules, break_glass_rules, ws_authz_notes, state_constraints (only if upstream state machine docs are missing)
- If tenant boundary rules are UNKNOWN → block Completeness Gate.
- If roles or permissions registries are UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] no new role_ids or perm_ids introduced
- [ ] api02_binding_format_defined == true
- [ ] tenant_isolation_rule_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
