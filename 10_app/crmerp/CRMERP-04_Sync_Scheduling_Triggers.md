# CRMERP-04 — Sync Scheduling & Triggers (cron/event-driven, env enablement)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-04 |
| title | Sync Scheduling & Triggers (cron/event-driven, env enablement) |
| type | crmerp_sync_scheduling_triggers |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-04_Sync_Scheduling_Triggers.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-03", "JBS-03", "FFCFG-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "CRMERP-03", "JBS-01", "JBS-03", "FFCFG-04", "RLIM-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical scheduling and trigger model for CRM/ERP sync: when sync runs
(cron/event/manual), what triggers it, per-environment enablement, backoff under vendor limits,
and operator controls. This template must be consistent with job scheduling rules, rate limits,
and feature/config matrices.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-03 Sync Direction Rules: {{crmerp.sync_direction}} | OPTIONAL
- JBS-01 Jobs Inventory: {{jobs.inventory}} | OPTIONAL
- JBS-03 Scheduling Rules: {{jobs.scheduling_rules}} | OPTIONAL
- FFCFG-04 Config Matrix: {{cfg.matrix}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- system_id binding
- Trigger types supported (cron/event/manual)
- Per-object trigger assignment (object → trigger)
- Cron schedule(s) (if used)
- Event triggers list (event_id/source) (if used)
- Manual trigger rules (who can run, rate limits)
- Env enablement rules (dev/stage/prod)
- Backoff policy under vendor rate limits
- Concurrency rules (avoid overlap)
- Telemetry requirements (runs, duration, failures)

## Optional Fields

- Time window constraints (business hours) | OPTIONAL
- Catch-up/backfill trigger rules | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Scheduling MUST respect vendor rate limits and internal concurrency limits.
- Env enablement must be explicit (no accidental prod runs).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Trigger Types
system_id: {{meta.system_id}}
supported: {{triggers.supported}} (cron/event/manual/UNKNOWN)
2. Per-Object Trigger Assignment
Assignment
external_object: {{assign[0].external_object}}
trigger_type: {{assign[0].trigger_type}}
schedule: {{assign[0].schedule}} | OPTIONAL
event_ref: {{assign[0].event_ref}} | OPTIONAL
notes: {{assign[0].notes}} | OPTIONAL
(Repeat per object.)
3. Cron Schedules (if applicable)
default_cron: {{cron.default}} | OPTIONAL
per_object_cron: {{cron.per_object}} | OPTIONAL
4. Event Triggers (if applicable)
events: {{events.list}} | OPTIONAL
producer_ref: {{events.producer_ref}} | OPTIONAL
5. Manual Triggers
who_can_trigger: {{manual.who_can_trigger}}
manual_rate_limit_rule: {{manual.rate_limit_rule}} | OPTIONAL
audit_required: {{manual.audit_required}} | OPTIONAL
6. Environment Enablement
dev_enabled: {{env.dev_enabled}}
stage_enabled: {{env.stage_enabled}} | OPTIONAL
prod_enabled: {{env.prod_enabled}}
config_ref: {{env.config_ref}} (expected: {{xref:FFCFG-04}}) | OPTIONAL
7. Backoff & Rate Limits
rate_limit_ref: {{limits.ref}} (expected: {{xref:RLIM-01}}) | OPTIONAL

backoff_policy: {{limits.backoff_policy}}
max_attempts: {{limits.max_attempts}} | OPTIONAL
8. Concurrency
prevent_overlap: {{conc.prevent_overlap}}
lock_key_rule: {{conc.lock_key_rule}} | OPTIONAL
9. Telemetry
sync_run_metric: {{telemetry.run_metric}}
sync_duration_metric: {{telemetry.duration_metric}} | OPTIONAL
sync_failure_metric: {{telemetry.failure_metric}} | OPTIONAL
10.References
System inventory: {{xref:CRMERP-01}}
Sync direction rules: {{xref:CRMERP-03}} | OPTIONAL
Jobs scheduling rules: {{xref:JBS-03}} | OPTIONAL
Config matrix: {{xref:FFCFG-04}} | OPTIONAL
Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
Observability/runbooks: {{xref:CRMERP-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CRMERP-08}}, {{xref:CRMERP-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define supported triggers and env enablement; use UNKNOWN for event
triggers if not used.
intermediate: Required. Define backoff, overlap prevention, and telemetry metrics.
advanced: Required. Add catch-up/backfill rules and time-window constraints with explicit
schedules.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, object notes, schedules/event refs, cron
details, events list/producer ref, manual rate limit/audit, config ref, max attempts, lock key,
optional telemetry metrics, time windows/backfill, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If triggers.supported is UNKNOWN → block Completeness Gate.
If env.prod_enabled is UNKNOWN → block Completeness Gate.
If limits.backoff_policy is UNKNOWN → block Completeness Gate.
If telemetry.run_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
trigger_assignments_defined == true

env_enablement_defined == true
rate_limit_backoff_defined == true
concurrency_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
