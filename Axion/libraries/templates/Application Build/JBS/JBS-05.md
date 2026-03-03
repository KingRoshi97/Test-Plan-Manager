# JBS-05 — Idempotency & Concurrency for Jobs

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-05                                             |
| Template Type     | Build / Jobs                                       |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with background jobs                  |
| Filled By         | Internal Agent                                     |
| Consumes          | WFO-03, JBS-01, ERR-05, DATA-08, Standards Index   |
| Produces          | Filled Idempotency & Concurrency Document          |

## 2. Purpose

Define job-specific idempotency keys, concurrency limits, locking scopes, and dedupe rules so retries and parallel workers do not cause duplicate side effects or data corruption.

## 3. Inputs Required

- WFO-03: `{{xref:WFO-03}}` | OPTIONAL
- JBS-01: `{{xref:JBS-01}}` | OPTIONAL
- ERR-05: `{{xref:ERR-05}}` | OPTIONAL
- DATA-08: `{{xref:DATA-08}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Idempotency key policy (when req)   | spec         | No              |
| Key derivation rules                | spec         | No              |
| TTL policy for keys                 | spec         | No              |
| Default concurrency (workers)       | spec         | No              |
| Per-job concurrency caps            | spec         | No              |
| Partitioning rules (tenant/entity)  | spec         | No              |
| Lock scope (entity/tenant/global)   | spec         | No              |
| Lock timeout policy                 | spec         | No              |
| Dedupe detection window             | spec         | No              |
| Dedupe handling (skip/merge)        | spec         | No              |
| Job mapping table (min 12)          | JBS-01       | No              |
| Verification checklist              | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Exactly-once disclaimer     | spec   | Proven semantics only            |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- No claims of exactly-once without proven semantics; default at-least-once with dedupe.
- Keys must be deterministic and stable for the job's logical unit of work.
- Partition keys must align with data isolation rules (tenant boundaries).
- Locking must be minimal and avoid global locks unless justified.

## 7. Output Format

### Required Headings (in order)

1. `## Global Policy` — idempotency required for, key TTL, default concurrency, lock timeout
2. `## Job Concurrency & Idempotency Map` — Table: job_id, idem_key_def, key_ttl, partition_key, concurrency_cap, lock_scope, lock_timeout, dedupe_window, dup_behavior, notes
3. `## Dedupe Rules` — duplicate detection, handling, window defaults
4. `## Verification Checklist` — validation checks

## 8. Cross-References

- **Upstream**: WFO-03, ERR-05
- **Downstream**: JBS-06, QA-03
- **Standards**: STD-RELIABILITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Global policy + mapping table        | Required  | Required     | Required |
| Partitioning + caps per job          | Optional  | Required     | Required |
| Lock timeouts + dedupe behaviors     | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: exactly_once_disclaimer, notes
- If any write job lacks idem_key_def → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] map_present == true
- [ ] idem_defined_for_write_jobs == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
