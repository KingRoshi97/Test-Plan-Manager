# JBS-01 — Jobs Inventory (by job_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-01                                             |
| Template Type     | Build / Jobs                                       |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with background jobs                  |
| Filled By         | Internal Agent                                     |
| Consumes          | WFO-01, WFO-04, EVT-01, ERR-05, RELIA-01, Standards Index |
| Produces          | Filled Jobs Inventory                              |

## 2. Purpose

Define the canonical registry of background jobs by stable job_id: what jobs exist, why they exist, how they're triggered, what they touch, and what reliability controls apply.

## 3. Inputs Required

- WFO-01: `{{xref:WFO-01}}` | OPTIONAL
- WFO-04: `{{xref:WFO-04}}` | OPTIONAL
- EVT-01: `{{xref:EVT-01}}` | OPTIONAL
- ERR-05: `{{xref:ERR-05}}` | OPTIONAL
- RELIA-01: `{{xref:RELIA-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Jobs list (min 12 or justified)     | spec         | No              |
| job_id (stable)                     | spec         | No              |
| name                                | spec         | No              |
| purpose                             | spec         | No              |
| type (scheduled/event/api/manual)   | spec         | No              |
| trigger definition                  | spec         | No              |
| owner_service/boundary              | spec         | No              |
| inputs (high level)                 | spec         | No              |
| outputs/side effects                | spec         | No              |
| data sensitivity level (PII)        | spec         | No              |
| idempotency requirement             | spec         | No              |
| concurrency posture                 | spec         | No              |
| retry profile (ERR-05)              | ERR-05       | No              |
| DLQ/quarantine behavior pointer     | WFO-05       | No              |
| observability requirements          | spec         | No              |
| runbook pointer                     | OPS-06       | Yes             |

## 5. Optional Fields

| Field Name       | Source | Notes                          |
|------------------|--------|--------------------------------|
| Priority class   | spec   | Only if applicable             |
| Notes            | agent  | Enrichment only, no new truth  |

## 6. Rules

- job_id must be stable and never reused for different behavior.
- Jobs must declare retry profile and idempotency stance.
- High-PII jobs require explicit redaction rules.
- Scheduled jobs must declare env enablement and safety constraints.

## 7. Output Format

### Required Headings (in order)

1. `## Jobs Inventory` — Table: job_id, name, type, trigger, owner, inputs, outputs, pii, idempotent, concurrency, retry_profile, dlq_behavior, obs, notes
2. `## Coverage Checks` — job_ids unique, all jobs have retry_profile, all jobs have idempotency stance

## 8. Cross-References

- **Upstream**: WFO-01, ERR-05
- **Downstream**: JBS-02, JBS-04, JBS-06
- **Standards**: STD-RELIABILITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Inventory rows + trigger + owner     | Required  | Required     | Required |
| retry_profile + idempotency + conc.  | Optional  | Required     | Required |
| DLQ behavior + observability fields  | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: priority_class, notes, runbook_pointer
- If any job lacks retry_profile or idempotency stance → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] jobs_count >= 12 (or justified)
- [ ] unique_job_ids == true
- [ ] retry_profiles_present == true
- [ ] idempotency_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
