---
library: ops
id: OPS-4
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# OPS-4 — Validation Checklist (Performance Budgets & Profiling)

## Schema Validation
- [ ] Performance budget document conforms to its schema
- [ ] All stage IDs in `stage_budgets_ms` are valid pipeline stage identifiers
- [ ] All budget values are positive integers (milliseconds)
- [ ] `run_budget_ms` is a positive integer
- [ ] `run_budget_ms` is greater than or equal to the largest single stage budget

## Profiling Validation
- [ ] `profiling.enabled` is a boolean
- [ ] `profiling.capture_threshold_ms` is a positive integer
- [ ] `profiling.capture_threshold_ms` is less than or equal to the smallest stage budget
- [ ] `profiling.artifacts.profile_output_path` contains the `<run_id>` placeholder

## Budget Completeness
- [ ] Every pipeline stage has a corresponding entry in `stage_budgets_ms`
- [ ] No extra stage IDs exist that are not in the pipeline definition
- [ ] Sum of stage budgets is documented relative to `run_budget_ms`

## Registry Validation
- [ ] Document version field is a valid semver string
- [ ] `doc_id` matches the expected identifier (`PERF-01`)

## Cross-Reference Validation
- [ ] Stage IDs match the pipeline definition stage list
- [ ] Run budget aligns with SLO latency objectives (OPS-3/SLO-01)
- [ ] Alert condition for budget overrun exists in alert rules (OPS-1/ALRT-01)
