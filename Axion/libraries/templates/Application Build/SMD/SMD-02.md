# SMD-02 — Query/Cache Strategy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-02                                           |
| Template Type     | Build / State Management                         |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring query/cache strategy      |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Query/Cache Strategy                      |

## 2. Purpose

Define the canonical service-to-service contracts: what each service exposes, what it consumes, expected inputs/outputs, error contracts, SLAs, versioning, and backward-compatibility requirements. This template ensures service boundaries are well-defined and contractually enforced.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-01 Service Catalog: {{smd.service_catalog}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Contract registry (contract_id list) | spec | No |
| Provider service_id | SMD-01 | No |
| Consumer service_id(s) | SMD-01 | No |
| Contract interface (method/endpoint/event) | spec | No |
| Input schema | spec | No |
| Output schema | spec | No |
| Error contract | API-03 | Yes |
| SLA (latency, availability) | spec | Yes |
| Versioning policy | spec | Yes |
| Backward compatibility requirements | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Contract testing approach | spec | OPTIONAL |
| Deprecation policy | spec | OPTIONAL |
| Circuit breaker config ref | SMD-04 | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Every contract MUST bind to valid service_ids from {{xref:SMD-01}}.
- Do not invent service_ids or endpoint_ids not present in upstream inputs.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:SMD-01}}, {{xref:API-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SMD-04}}, {{xref:SMD-05}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-VERSIONING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Required | Define provider/consumer and basic schemas; SLA UNKNOWN ok. |
| intermediate | Required | Add SLAs, error contracts, and versioning policy. |
| advanced | Required | Add contract testing, deprecation policy, and circuit breaker refs. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, error_contract, sla, versioning policy, backward_compat, deprecation_policy, contract_testing, circuit_breaker_ref, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If contract_id list is UNKNOWN → block Completeness Gate.
- If provider/consumer service_ids are UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SMD
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] all contract_ids are unique
  - [ ] provider/consumer bind to valid service_ids
  - [ ] input/output_schemas_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

