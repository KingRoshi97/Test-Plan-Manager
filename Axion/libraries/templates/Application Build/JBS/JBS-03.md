# JBS-03 — Scheduling Rules (cron/event-driven, env enablement)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-03                                             |
| Template Type     | Build / Jobs                                       |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with scheduled or event-driven jobs   |
| Filled By         | Internal Agent                                     |
| Consumes          | JBS-01, WFO-04, ENV-01, RELIA-01, Standards Index  |
| Produces          | Filled Scheduling Rules Document                   |

## 2. Purpose

Define deterministic scheduling rules for all jobs: cron policies, event-driven dispatch rules, environment enablement, timezone handling, and safety constraints to prevent runaway schedules.

## 3. Inputs Required

- JBS-01: `{{xref:JBS-01}}` | OPTIONAL
- WFO-04: `{{xref:WFO-04}}` | OPTIONAL
- ENV-01: `{{xref:ENV-01}}` | OPTIONAL
- RELIA-01: `{{xref:RELIA-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Supported schedule types            | spec         | No              |
| Timezone standard                   | spec         | No              |
| Environment enablement rules        | ENV-01       | No              |
| Cron minimum interval               | spec         | No              |
| High-frequency approval rules       | spec         | No              |
| Blackout windows                    | spec         | Yes             |
| Dispatch dedupe policy              | spec         | No              |
| Concurrency caps per job            | spec         | No              |
| Job schedule bindings (min 10)      | JBS-01       | No              |
| Verification checklist              | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Maintenance window policy   | spec   | Blackout/maintenance rules       |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- Schedules must be explicit and valid; no ambiguous natural language.
- All scheduled jobs must define timezone.
- High-frequency schedules require explicit approval and observability.
- Event-driven jobs must define dedupe keys for dispatch.

## 7. Output Format

### Required Headings (in order)

1. `## Global Scheduling Rules` — supported types, timezone standard, default enablement
2. `## Cron Safety Rules` — minimum interval, high-frequency approval, blackout windows
3. `## Dispatch Rules` — dedupe policy, concurrency caps, failure behavior
4. `## Job Schedule Bindings` — Table: job_id, schedule_type, expression/trigger, timezone, envs, concurrency_cap, notes
5. `## Verification Checklist` — validation checks

## 8. Cross-References

- **Upstream**: ENV-01, WFO-04
- **Downstream**: JBS-04, JBS-06, ALRT-*
- **Standards**: STD-RELIABILITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Global rules + schedule bindings     | Required  | Required     | Required |
| Cron safety + dispatch dedupe        | Optional  | Required     | Required |
| Approvals + maintenance/blackout     | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: maintenance_window_policy, notes, dispatch_failure_behavior, blackout_windows
- If any scheduled job lacks timezone or env enablement → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] bindings_present == true
- [ ] timezone_defined_for_scheduled == true
- [ ] env_enablement_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
