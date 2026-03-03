# JBS-04 — Retry/DLQ Policy (backoff, poison messages)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-04                                             |
| Template Type     | Build / Jobs                                       |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with background jobs requiring retries |
| Filled By         | Internal Agent                                     |
| Consumes          | JBS-01, JBS-02, ERR-05, WFO-05, RELIA-01, Standards Index |
| Produces          | Filled Retry/DLQ Policy Document                   |

## 2. Purpose

Define the canonical retry and dead-letter-queue (DLQ) policy for background jobs: backoff strategies, max attempts, poison message detection and handling, DLQ routing, alerting thresholds, and operator procedures for DLQ processing.

## 3. Inputs Required

- JBS-01: `{{xref:JBS-01}}` | OPTIONAL
- JBS-02: `{{xref:JBS-02}}` | OPTIONAL
- ERR-05: `{{xref:ERR-05}}` | OPTIONAL
- WFO-05: `{{xref:WFO-05}}` | OPTIONAL
- RELIA-01: `{{xref:RELIA-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Retry profiles (named)             | ERR-05       | No              |
| Backoff strategies per profile     | spec         | No              |
| Max attempts per profile           | spec         | No              |
| Retryable error classes            | ERR-05       | No              |
| Non-retryable error classes        | ERR-05       | No              |
| DLQ routing rules                  | spec         | No              |
| DLQ schema (captured fields)      | spec         | No              |
| Poison message detection rules    | spec         | No              |
| Poison message handling actions    | spec         | No              |
| DLQ retention policy               | spec         | No              |
| Operator controls (drain/replay)   | spec         | No              |
| Alerting thresholds                | spec         | No              |
| Per-job retry bindings             | JBS-01       | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Per-job override rules      | spec   | Job-specific retry overrides     |
| Circuit breaker rules       | spec   | Only if applicable               |
| DLQ reprocessing rules      | spec   | Replay/reprocessing procedures   |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- Retry profiles must be reusable and named; per-job overrides must be explicit.
- Backoff must include jitter to prevent thundering herd.
- Poison messages must be detected and routed to DLQ, not retried indefinitely.
- DLQ records must capture enough context for debugging and replay.
- Operator actions on DLQ must be audited.

## 7. Output Format

### Required Headings (in order)

1. `## Retry Profiles` — Table: profile_id, backoff_strategy, max_attempts, retryable_classes, notes
2. `## Non-Retryable Error Classes` — list of error classes that go directly to DLQ
3. `## DLQ Model` — routing rules, DLQ location, record schema
4. `## Poison Message Handling` — detection rules, actions, quarantine
5. `## DLQ Retention & Cleanup` — retention policy, purge rules
6. `## Per-Job Retry Bindings` — Table: job_id, retry_profile, overrides, notes
7. `## Operator Controls` — drain, replay, purge, audit requirements
8. `## Alerting` — DLQ depth thresholds, retry rate alerts

## 8. Cross-References

- **Upstream**: JBS-01, ERR-05, RELIA-01
- **Downstream**: JBS-05, JBS-06, ALRT-*
- **Standards**: STD-RELIABILITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Retry profiles + per-job bindings    | Required  | Required     | Required |
| DLQ model + poison handling          | Optional  | Required     | Required |
| Operator controls + alerting         | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: per_job_overrides, circuit_breaker_rules, dlq_reprocessing_rules, notes
- If any job lacks retry profile binding → block Completeness Gate.
- If poison message handling is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] retry_profiles_defined == true
- [ ] dlq_model_defined == true
- [ ] poison_handling_defined == true
- [ ] per_job_bindings_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
