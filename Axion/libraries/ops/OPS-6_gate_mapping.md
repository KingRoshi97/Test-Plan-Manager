---
library: ops
id: OPS-6a
schema_version: 1.0.0
status: draft
---

# OPS-6a — Gate Mapping

## Mapping: OPS-GATE → Pipeline Stage

| OPS Gate | Pipeline Stage | Inputs | Pass Condition |
|----------|---------------|--------|----------------|
| OPS-GATE-01 | intake / canonical | ALRT-01 alert rules, ALRT-01 schema | Alert rules validate against schema; all severity levels mapped to escalation tiers; thresholds are numeric and non-zero |
| OPS-GATE-02 | intake / canonical | LTS-01 logging standards | Required log fields defined; correlation ID generation policy present; redaction rules specified; log levels mapped |
| OPS-GATE-03 | planning | SLO-01 policy, SLO-01 schema | All objectives have measurable targets; error budget windows defined; burn-rate alert thresholds set; enforcement actions specified |
| OPS-GATE-04 | planning | PERF-01 budgets, PERF-01 schema | Stage-level budgets assigned; profiling capture thresholds defined; budget units are consistent |
| OPS-GATE-05 | planning | COST-01 model, COST-01 schema | Capacity assumptions documented; compute/storage quotas present; quota hook endpoints configured |
| OPS-GATE-06 | verification | All ops artifacts, ops_registry | All ops registry entries have corresponding artifacts; no dangling references; all schemas validate |

## Per-Gate Evidence Requirements

### OPS-GATE-01: Alert Rules Valid
- ALRT-01 registry file present and readable
- Schema validation result (pass/fail + errors)
- Escalation tier completeness check
- Threshold value validity check

### OPS-GATE-02: Logging & Tracing Configured
- LTS-01 standards file present and readable
- Required fields enumeration check
- Correlation ID policy presence
- Redaction policy presence

### OPS-GATE-03: SLO Policy Enforced
- SLO-01 policy file present and readable
- Objective target validation (measurable, bounded)
- Error budget window definition check
- Burn-rate threshold configuration check

### OPS-GATE-04: Performance Budgets Set
- PERF-01 budgets file present and readable
- Stage budget assignment completeness
- Profiling threshold configuration
- Budget unit consistency check

### OPS-GATE-05: Cost Model Bound
- COST-01 model file present and readable
- Capacity assumption documentation check
- Quota definition completeness
- Quota hook endpoint validation

### OPS-GATE-06: Ops Evidence Complete
- All ops registry entries have artifact files
- Cross-reference integrity (no dangling refs)
- Schema validation for all ops artifacts
- Staleness check (no artifacts older than policy window)

## Failure Behavior
- Each gate produces its own evidence block with:
  - What failed
  - Which artifacts were checked
  - Remediation steps
- Ops gate results are aggregated into the run's operational readiness report
