# MBAT-01 — Mobile Performance Budget

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MBAT-01                                          |
| Template Type     | Build / Mobile Performance                       |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mobile performance budget |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Mobile Performance Budget                 |

## 2. Purpose

Define the canonical rules for background work on mobile: what jobs/tasks run in the background, scheduling constraints, OS API usage, and how background work interacts with battery, network, and sync policies. This template must be consistent with offline sync and network usage policies and must not invent background work not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- MBAT-02: `{{mbat.net_policy}}` | OPTIONAL
- SMD-05: `{{smd.offline_handling}}` | OPTIONAL
- OFS-02: `{{ofs.sync_model}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Background task registry (task_id list) | spec | No |
| Per-task scheduling rules (periodic/event/deferred) | spec | No |
| OS API usage (WorkManager, BGTaskScheduler, etc.) | spec | No |
| OS constraints (minimum intervals, battery saver limits) | spec | No |
| Network requirement per task | MBAT-02 | No |
| Battery impact classification (low/medium/high) | spec | No |
| Retry/failure rules per task | spec | No |
| Telemetry requirements | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Exact vs inexact scheduling notes | spec | OS version differences |
| Priority ordering for tasks | spec | If competing tasks |
| Open questions | agent | Enrichment only |

## 6. Rules

- Background work MUST comply with OS constraints and battery saver modes.
- Tasks MUST NOT use excessive CPU/network in background.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Background Task Registry` — Per task: task_id, name, type, schedule, os_api, network_required, battery_impact, retry_rule, telemetry_metric, notes, open_questions
2. `## OS Constraints` — min_interval_android, min_interval_ios, battery_saver_behavior, doze_mode_behavior
3. `## Network Requirements` — per_task_network_rule, wifi_only_tasks, metered_allowed_tasks
4. `## Battery Impact` — classification_rule, high_impact_tasks, mitigation_strategy
5. `## Retry / Failure` — default_retry_policy, max_retries, backoff_policy
6. `## Telemetry` — task_start_metric, task_complete_metric, task_failure_metric

## 8. Cross-References

- **Upstream**: SPEC_INDEX, SMD-05, OFS-02
- **Downstream**: MBAT-02, MBAT-03, MBAT-04
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Task registry + basic scheduling | Required | Required | Required |
| OS constraints + retry policies | Optional | Required | Required |
| Priority ordering + exact scheduling | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, name, schedule details, notes, doze mode, wifi only/metered tasks, mitigation strategy, backoff policy, telemetry optional fields, exact scheduling/priority notes, open_questions
- If task registry is UNKNOWN → block Completeness Gate.
- If os_api is UNKNOWN → block Completeness Gate.
- If battery_impact is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] task_registry_defined == true
- [ ] os_constraints_defined == true
- [ ] battery_impact_classified == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
