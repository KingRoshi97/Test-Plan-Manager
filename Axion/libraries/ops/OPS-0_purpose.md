---
library: ops
id: OPS-0
section: purpose
schema_version: 1.0.0
status: draft
---

# OPS-0 — ops/ Purpose + Boundaries

## Purpose
`ops/` defines the **operational governance contract**: the monitoring rules, logging standards,
SLO/SLA policies, performance budgets, cost models, and ops evidence requirements that govern
every Axion pipeline run.

This library is the source-of-truth for:
- what monitoring and alerting rules apply (alert definitions, severity tiers, escalation)
- how logging and tracing must be structured (required fields, correlation IDs, redaction)
- what SLO/SLA objectives and error budgets are enforced
- what performance budgets constrain each pipeline stage and full runs
- what cost and capacity models define resource expectations
- what ops evidence must be produced for gate evaluation
- what the minimum viable ops set is for a valid Axion run

## What it governs (in scope)
- **Monitoring & alert standards**: alert rule definitions, severity levels, escalation tiers, cooldown policies. References ALRT-01 data.
- **Logging & tracing standards**: required log fields, correlation ID requirements, log levels, redaction policies. References LTS-01 data.
- **SLO/SLA & error budget policy**: service level objectives, budget windows, burn-rate alerts, enforcement actions. References SLO-01 data.
- **Performance budgets & profiling**: per-stage time budgets, total run budgets, profiling capture thresholds. References PERF-01 data.
- **Cost models & quota hooks**: capacity assumptions, compute/storage units, per-run and per-day estimates, quota policy hooks. References COST-01 data.
- **Ops gates & evidence**: which gate checks require ops evidence, what ops evidence artifacts are produced, mapping to pipeline stages.
- **Minimum viable ops**: the minimum set of ops artifacts required for a valid pipeline run.

## What it does NOT govern (out of scope)
- Gate evaluation logic and predicate DSL → `gates/`
- Risk classes and override policies → `policy/`
- Telemetry sink configuration and transport → `telemetry/`
- Audit trail storage and compliance ledger → `audit/`
- Pipeline stage ordering and IO contracts → `orchestration/`
- Workspace/project/pin configuration → `system/`
- Intake form schemas and normalization → `intake/`
- Canonical spec schema and unknown handling → `canonical/`
- Standards packs and resolution logic → `standards/`
- Template registry and rendering rules → `templates/`
- Knowledge library selection rules → `knowledge/`
- Verification proof ledger and completion criteria → `verification/`
- Kit packaging rules → `kit/`

## Consumers (what reads ops/)
- Pipeline runner (enforces performance budgets and SLO constraints at runtime)
- Gate evaluator (reads ops evidence for gate pass/fail decisions)
- Operator UI (displays ops health metrics, alert status, SLO dashboards)
- Audit ledger (references ops evidence artifacts for compliance tracing)
- Cost planner (reads capacity models for resource allocation)

## Determinism requirements
- Ops definitions (alert rules, SLO policies, performance budgets) are versioned and immutable within a run.
- Alert rule evaluation is deterministic given the same counter/timing inputs.
- SLO calculations are deterministic given the same measurement window and data.
- Performance budget comparisons are deterministic given the same timing data.
- Cost model estimates are deterministic given the same assumption inputs.

## Outputs (what ops/ produces)
- Alert rule registry (all monitoring alert definitions with severity and escalation)
- Logging and tracing standards (required fields, correlation requirements, redaction patterns)
- SLO/SLA policy records (objectives, error budget windows, burn-rate alert thresholds)
- Performance budget records (per-stage and per-run time budgets, profiling policy)
- Cost model records (capacity assumptions, compute/storage units, estimates)
- Ops decision reports (what was evaluated, what evidence was used, what the verdict was)
