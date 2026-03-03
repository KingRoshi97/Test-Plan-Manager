# ADMIN-05 — Privileged API Surface Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ADMIN-05                                         |
| Template Type     | Build / Admin                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring privileged api surface ca |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Privileged API Surface Catalog            |

## 2. Purpose

Create the canonical catalog of privileged/admin API endpoints, including endpoint identifiers, operations, required permissions, ABAC constraints, risk class, audit requirements, and safeguards. This template must be consistent with API endpoint specs and AuthZ rules and must not invent endpoint IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- API-02 Endpoint Specs: {{api.endpoint_specs}}
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Privileged endpoints list | API-01 | No |
| Endpoint path/method | API-01 | No |
| Purpose/description | spec | No |
| Required permissions/roles | API-04 | No |
| ABAC constraints | API-04 | Yes |
| Risk class | spec | Yes |
| Audit required and audit ref | ADMIN-03 | No |
| Safeguards | spec | Yes |
| Rate limit policy for privileged surface | RLIM | Yes |
| Error mapping reference | API-03 | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Concealment policy (403 vs 404) | spec | OPTIONAL |
| Two-person approval requirement | spec | OPTIONAL |
| Runbook pointer | ops | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent endpoint_ids; use only those in {{xref:API-01}}.
- AuthZ MUST bind to {{xref:API-04}}; audit MUST bind to {{xref:ADMIN-03}} when present.
- High-risk endpoints SHOULD have safeguards unless explicitly disallowed.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:API-01}}, {{xref:API-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL, {{xref:RUNBOOK-ADMIN}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Use UNKNOWN where risk/audit/safeguards are missing; do not invent endpoint IDs. |
| intermediate | Required | Bind authz/audit and specify ABAC constraints. |
| advanced | Required | Add runbooks and two-person approval for critical endpoints if applicable. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, name, deny_behavior, audit_ref, rate_limit_ref, error_policy_ref, implementation_notes, runbook_ref, two-person approvals, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If endpoints list is UNKNOWN → block Completeness Gate.
- If required_permissions is UNKNOWN → block Completeness Gate.
- If audit_required is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.ADMIN
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] all endpoint_ids exist in API-01 (no new IDs introduced)
  - [ ] authz_constraints_defined == true
  - [ ] audit_requirements_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

