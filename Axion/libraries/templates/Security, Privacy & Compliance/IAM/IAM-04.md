# IAM-04 — Authentication Flow Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-04                                           |
| Template Type     | Security / IAM                                   |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring authentication flow spec  |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Authentication Flow Spec                  |

## 2. Purpose

Define the canonical set of authorization enforcement points (AEPs): where AuthZ checks occur across API, background jobs, websockets, admin surfaces, and client routing. This template ensures AuthZ is enforced server-side and consistently instrumented.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- API surface: `{{xref:API-01}}` | OPTIONAL
- AuthZ rules: `{{xref:API-04}}` | OPTIONAL
- Route guard rules: `{{xref:ROUTE-04}}` | OPTIONAL
- Security architecture: `{{xref:SEC-02}}` | OPTIONAL
- Privileged API catalog: `{{xref:ADMIN-05}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Enforcement point registry (aep_id list) | spec | No |
| aep_id (stable identifier) | spec | No |
| Surface type (api/ws/job/admin/client) | spec | No |
| Location (middleware/handler/gateway) | spec | No |
| What is checked (role/perm/abac attribute) | spec | No |
| Decision inputs (user_id, tenant_id, resource_id) | spec | No |
| Decision outputs (allow/deny + reason_code) | spec | No |
| Fail-closed rule (default deny) | spec | No |
| Telemetry requirements (deny metrics by AEP) | spec | No |
| Testing requirements (minimum coverage) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Policy engine details | spec | OPTIONAL |
| Caching policy for decisions | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- AuthZ must be enforced server-side; client-side checks are advisory only.
- Default-deny (fail closed) must be documented.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Cross-References

- **Upstream**: `{{xref:API-04}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IAM-10}}`, `{{xref:SEC-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define AEP list and what each checks and fail-closed rule. |
| intermediate | Required. Define decision inputs/outputs and telemetry. |
| advanced | Required. Add policy engine, caching, and testing coverage detail. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, notes, policy engine, caching policy, test approach, breakdown fields, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `aeps.list` is UNKNOWN → block Completeness Gate.
- If `policy.default_deny_rule` is UNKNOWN → block Completeness Gate.
- If `telemetry.deny_metric` is UNKNOWN → block Completeness Gate.
- If `tests.minimum_coverage` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IAM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] aep_registry_defined == true
  - [ ] fail_closed_defined == true
  - [ ] telemetry_defined == true
  - [ ] testing_requirements_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

