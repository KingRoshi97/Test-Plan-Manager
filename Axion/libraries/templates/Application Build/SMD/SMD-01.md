# SMD-01 — State Architecture

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-01                                           |
| Template Type     | Build / State Management                         |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring state architecture        |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled State Architecture                        |

## 2. Purpose

Create the canonical inventory of all backend services/microservices: service_id, domain ownership, responsibilities, API bindings, dependencies, and deployment metadata. This template drives all downstream service-level design templates.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PRD-01 Feature Inventory: {{prd.features}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Service registry (service_id list) | spec | No |
| Service name | spec | No |
| Domain ownership | domain.map | Yes |
| Responsibilities/purpose | spec | No |
| API bindings (endpoint_ids served) | API-01 | Yes |
| Service dependencies (service_ids consumed) | spec | Yes |
| Runtime/language | spec | Yes |
| Owner team | spec | Yes |
| Repository ref | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Deployment target | ops | OPTIONAL |
| Scaling policy ref | ops | OPTIONAL |
| SLA tier | ops | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Every service_id MUST be unique.
- Services SHOULD bind to domain(s) from {{domain.map}} when available.
- Do not invent endpoint_ids; use only those in {{xref:API-01}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:PRD-01}} | OPTIONAL, {{xref:API-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SMD-02}}, {{xref:SMD-03}}, {{xref:SMD-04}}, {{xref:SMD-05}}, {{xref:SMD-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | List services with names and responsibilities; domain UNKNOWN ok. |
| intermediate | Required | Bind to API endpoints and define dependencies. |
| advanced | Required | Add deployment targets, scaling policies, SLA tiers. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, domain, api_bindings, dependencies, runtime, owner_team, repo_ref, deployment_target, scaling_policy_ref, sla_tier, graph_description, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If service_id list is UNKNOWN → block Completeness Gate.
- If responsibilities is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SMD
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] all service_ids are unique
  - [ ] responsibilities_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

