# SMD-04 — Realtime Subscription Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-04                                           |
| Template Type     | Build / State Management                         |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring realtime subscription pat |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Realtime Subscription Patterns            |

## 2. Purpose

Define the canonical resilience patterns across services: circuit breaker configurations, retry policies, timeout budgets, fallback behaviors, bulkhead isolation, and graceful degradation strategies. This template ensures service-to-service interactions are resilient to partial failures.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-01 Service Catalog: {{smd.service_catalog}}
- SMD-02 Service Contracts: {{smd.service_contracts}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Resilience policy statement | spec | No |
| Circuit breaker configs (by dependency) | spec | Yes |
| Retry policies (by dependency or global) | spec | No |
| Timeout budgets | spec | No |
| Fallback behaviors | spec | Yes |
| Bulkhead/isolation patterns | spec | Yes |
| Graceful degradation policy | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Chaos testing policy | spec | OPTIONAL |
| Health check definitions | spec | OPTIONAL |
| Observability/metrics for resilience | spec | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Every service dependency SHOULD have a resilience configuration (or be UNKNOWN flagged).
- Retry policies MUST specify max retries and backoff strategy.
- Timeout budgets MUST be defined per-dependency or globally.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:SMD-01}}, {{xref:SMD-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SMD-05}}, {{xref:SMD-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-RESILIENCE]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Not required | Resilience can be deferred to intermediate+. |
| intermediate | Required | Define retry, timeout, and basic circuit breaker policies. |
| advanced | Required | Add bulkhead isolation, chaos testing, and degradation tiers. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, circuit breaker configs, fallback behaviors, bulkhead model, degradation policy, feature_flag_integration, chaos_testing, health_checks, observability, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If retry_policies is UNKNOWN → block Completeness Gate.
- If timeout_budgets is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SMD
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] retry_policies_defined == true
  - [ ] timeout_budgets_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

