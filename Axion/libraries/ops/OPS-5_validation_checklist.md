---
library: ops
id: OPS-5
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# OPS-5 — Validation Checklist (Cost Models & Quota Hooks)

## Schema Validation
- [ ] Cost model document conforms to its schema
- [ ] `model_id` is a non-empty string
- [ ] `assumptions` object contains all required fields
- [ ] All assumption values are positive numbers
- [ ] `units.compute` and `units.storage` are non-empty strings

## Estimate Validation
- [ ] `estimates.per_run` contains `compute_cpu_seconds` and `storage_mb`
- [ ] `estimates.per_day` contains `compute_cpu_seconds` and `storage_mb`
- [ ] Per-day estimates are consistent with per-run estimates × `runs_per_day`
- [ ] All estimate values are positive numbers

## Quota Hook Validation
- [ ] Each quota hook has a defined trigger point
- [ ] Each quota hook has a defined action on breach
- [ ] Quota thresholds are expressed as multiples of baseline estimates
- [ ] Pre-run quota references daily aggregate capacity

## Registry Validation
- [ ] Document version field is a valid semver string
- [ ] `doc_id` matches the expected identifier (`COST-01`)
- [ ] No duplicate `model_id` values in the registry

## Cross-Reference Validation
- [ ] Compute estimates align with performance budget run duration (OPS-4/PERF-01)
- [ ] Storage estimates align with expected artifact sizes from kit packaging
- [ ] Quota breach warnings integrate with monitoring alerts (OPS-1/ALRT-01)
