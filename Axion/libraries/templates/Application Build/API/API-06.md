# API-06 — Background Jobs Spec (API-triggered + system jobs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-06                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with API-triggered or system background jobs |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, API-01, API-02, API-03, API-05, JBS-01, RLIM-01, FFCFG-01 |
| Produces          | Filled Background Jobs Spec                        |

## 2. Purpose

Define the canonical specification format for background jobs that are initiated by API actions or run as system jobs, including triggers, inputs/outputs, idempotency, concurrency, retries, DLQ handling, status surfaces, and observability requirements. This template must be consistent with the Endpoint Catalog and per-endpoint specs and must not invent job IDs, triggers, or behavior not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- API-01: `{{api.endpoint_catalog}}`
- API-02: `{{api.endpoint_specs}}`
- API-03: `{{api.error_policy}}`
- API-05: `{{api.ratelimit_policy}}` | OPTIONAL
- JBS-01: `{{jbs.jobs_inventory}}` | OPTIONAL
- RLIM-01: `{{rlim.policy}}` | OPTIONAL
- FFCFG-01: `{{ffcfg.flags}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Job linkage model                   | spec         | No              |
| Job identifier source rule          | JBS-01       | No              |
| Trigger types                       | spec         | No              |
| Trigger definition format           | spec         | No              |
| Job lifecycle model                 | spec         | No              |
| Inputs contract                     | spec         | No              |
| Outputs contract                    | spec         | No              |
| Idempotency rules                   | spec         | No              |
| Concurrency rules                   | spec         | No              |
| Retry policy binding                | JBS-04       | No              |
| DLQ/poison handling binding         | JBS-04       | No              |
| Status surfacing rules              | spec         | No              |
| Cancellation policy                 | spec         | No              |
| Timeouts/SLO fields                 | spec         | No              |
| Observability fields                | spec         | No              |
| Security constraints                | spec         | No              |

## 5. Optional Fields

| Field Name                          | Source | Notes                          |
|-------------------------------------|--------|--------------------------------|
| Job priority classes                | spec   | Only if applicable             |
| Backfill/replay rules               | spec   | Only if applicable             |
| Manual operator controls            | spec   | Only if applicable             |
| Rate-limit coupling rules           | RLIM   | Job-trigger throttles          |
| Feature-flag enablement per env     | FFCFG  | Per-environment rules          |
| Resource cost hints                 | spec   | CPU/mem/queue                  |

## 6. Rules

- Do not introduce new job_ids; use job IDs from JBS-01 as given.
- Every background job referenced by an API endpoint MUST have a job spec entry or be marked UNKNOWN.
- Every job MUST be traceable to its trigger source.
- All status surfaces MUST map errors to API-03.
- All access to job artifacts/status MUST obey API-04.
- Retries/DLQ MUST follow JBS-04.
- If idempotency is required, bind to JBS-05.

## 7. Output Format

### Required Headings (in order)

1. `## Job Linkage Model` — how endpoints declare job triggers, canonical binding block
2. `## Job Identifier Rules` — job_id source, allowed format
3. `## Trigger Types` — API-triggered, system-triggered, other
4. `## Trigger Definition Format` — trigger fields
5. `## Job Lifecycle Model` — states, transitions, terminal states
6. `## Inputs Contract` — schema ref, fields, provenance
7. `## Outputs Contract` — schema ref, fields, evidence refs
8. `## Idempotency Rules` — key source, dedup window, conflict behavior
9. `## Concurrency Rules` — scope, max in-flight, locking
10. `## Retry & DLQ Binding` — retry policy ref, per-job overrides, poison handling
11. `## Status Surfacing` — exposure model, endpoint id, response fields
12. `## Cancellation Policy` — cancelable, allowed principals, behavior
13. `## Timeouts & SLOs` — hard timeout, SLO target, SLO class
14. `## Observability` — correlation IDs, logs, metrics, traces, alerts
15. `## Security & Compliance` — PII policy, redaction, access control, retention

## 8. Cross-References

- **Upstream**: SPEC_INDEX, API-01, API-02, JBS-01, STANDARDS_INDEX
- **Downstream**: JBS-02, JBS-03, JBS-04, JBS-05
- **Standards**: STD-NAMING, STD-UNKNOWN-HANDLING, STD-OBSERVABILITY

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| UNKNOWN for missing triggers/jobs    | Required  | Required     | Required |
| Bind jobs to endpoints + lifecycle   | Optional  | Required     | Required |
| Idempotency/concurrency + observ.    | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, rlim.policy, ffcfg.flags, job.priority_classes, replay_rules, manual_controls, feature_flag_enablement, resource_cost_hints, traces, alerts
- If job_id source rules are UNKNOWN → block Completeness Gate.
- If linkage model is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] no new job_ids introduced
- [ ] api02_job_binding_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
