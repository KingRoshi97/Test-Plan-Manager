---
library: ops
id: OPS-3
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# OPS-3 — Validation Checklist (SLO/SLA & Error Budgets)

## Schema Validation
- [ ] SLO policy conforms to its schema
- [ ] Each SLO has a unique `slo_id`
- [ ] `window_days` is a positive integer
- [ ] Ratio-based SLOs have `objective` in range (0.0, 1.0]
- [ ] Latency-based SLOs have `objective_ms` as a positive integer
- [ ] `measurement` is a non-empty string expression

## Error Budget Validation
- [ ] `budget_window_days` is a positive integer
- [ ] Burn alerts array is non-empty
- [ ] Each burn alert has a unique `burn_id`
- [ ] `threshold` values are in range (0.0, 1.0]
- [ ] `window_hours` is a positive integer
- [ ] `action` is one of the defined enforcement actions

## Enforcement Action Validation
- [ ] All actions referenced in burn alerts are defined (`tighten_gates`, `freeze_changes`)
- [ ] Each action has a clear, reversible effect

## Registry Validation
- [ ] No duplicate `slo_id` values in the policy
- [ ] No duplicate `burn_id` values in the error budget
- [ ] Policy version field is a valid semver string

## Cross-Reference Validation
- [ ] Metrics referenced in `measurement` exist in telemetry schemas (OBS-01/OBS-02)
- [ ] Burn alert actions reference valid gate configuration mechanisms (OPS-6)
- [ ] SLO latency objectives are consistent with performance budgets (OPS-4/PERF-01)
