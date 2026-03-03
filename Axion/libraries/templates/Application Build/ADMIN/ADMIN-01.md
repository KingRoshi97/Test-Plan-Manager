# ADMIN-01 — Admin Capabilities Matrix

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-01                                         |
| Template Type     | Build / Admin                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring admin capabilities matrix |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Admin Capabilities Matrix                 |

## 2. Purpose

Create the canonical matrix of admin/internal tool capabilities: what actions exist, who can perform them, what scope they operate on, what audit requirements apply, and what safeguards/rate limits must be enforced. This template must be consistent with AuthZ rules and must not invent admin actions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Capability registry (capability_id list) | spec/API-01 | No |
| Capability description | spec | No |
| Surface (admin UI, admin API, CLI) | spec | Yes |
| Action binding (permission/action_id) | API-04 | No |
| Scope (global/org/project/resource) | spec | Yes |
| Risk class (low/med/high/critical) | spec | Yes |
| Safeguards required | spec | Yes |
| Audit required and audit ref | ADMIN-03 | Yes |
| Rate limits / abuse controls for admin surfaces | RLIM | Yes |
| Implementation references | API-01 | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Runbook/procedure pointers | ops | OPTIONAL |
| UI location notes | spec | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new permissions/roles; bind to {{xref:API-04}}.
- Every capability MUST bind to a concrete implementation surface (endpoint/tool) or be marked UNKNOWN and flagged.
- High-risk capabilities SHOULD require extra safeguards (two-step confirm, approvals) unless explicitly disallowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Audit requirements SHOULD bind to {{xref:ADMIN-03}} when available.

## 7. Cross-References

- **Upstream**: {{xref:API-01}}, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-02}}, {{xref:ADMIN-03}}, {{xref:ADMIN-05}}, {{xref:ADMIN-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-AUDIT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Use UNKNOWN where implementations are missing; do not invent permissions. |
| intermediate | Required | Populate safeguards/audit/risk classes and bind to endpoints. |
| advanced | Required | Add runbook pointers and strong controls for critical capabilities. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, surfaces/risk class summaries, audit_ref, rate_limit_ref, runbook_ref, ui_location, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If capability_id list is UNKNOWN → block Completeness Gate.
- If action_binding is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.ADMIN
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] all capability_ids are unique
  - [ ] no new permissions/roles introduced (binds to API-04)
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

