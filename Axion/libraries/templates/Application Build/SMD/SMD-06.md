# SMD-06 — Observability for Client Data Layer

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-06                                           |
| Template Type     | Build / State Management                         |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring observability for client  |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Observability for Client Data Layer       |

## 2. Purpose

Define the canonical deployment architecture for all services: containerization, orchestration, scaling policies, infrastructure requirements, CI/CD pipeline integration, and environment topology. This template ensures every service has a clear deployment plan.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-01 Service Catalog: {{smd.service_catalog}}
- SMD-05 Observability Plan: {{smd.observability_plan}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Deployment topology | spec | No |
| Container strategy | spec | No |
| Orchestration platform | spec | Yes |
| Per-service resource requirements | spec | Yes |
| Scaling policy | spec | No |
| Environment definitions (dev/staging/prod) | spec | No |
| CI/CD pipeline requirements | spec | Yes |
| Secret management approach | spec | Yes |
| Networking/service mesh | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Multi-region/AZ strategy | spec | OPTIONAL |
| Blue-green/canary strategy | spec | OPTIONAL |
| Infrastructure-as-code refs | ops | OPTIONAL |
| Cost estimation | ops | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Every service in {{xref:SMD-01}} SHOULD have deployment config defined (or UNKNOWN flagged).
- Scaling policies MUST define min/max and triggers.
- Environment definitions MUST include at least dev and prod.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:SMD-01}}, {{xref:SMD-05}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RUNBOOK}} | OPTIONAL, {{xref:OPS}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-DEPLOYMENT]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Not required | Deployment can be deferred to intermediate+. |
| intermediate | Required | Define topology, containers, scaling, and environments. |
| advanced | Required | Add CI/CD details, multi-region, canary strategies, IaC refs. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, orchestration platform, resource requirements, CI/CD details, secret management, service_mesh, multi-region, blue-green/canary, IaC refs, cost, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If deployment_topology is UNKNOWN → block Completeness Gate.
- If scaling_policy is UNKNOWN → block Completeness Gate.
- If environments is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SMD
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] deployment_topology_defined == true
  - [ ] scaling_policies_defined == true
  - [ ] environments_defined == true (at least dev + prod)
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

