# FEAT-014 — Coverage Scoring Engine: Observability

## 1. Metrics

- `coverage.score.computed` — Emitted after each `computeCoverage()` call, includes `total_items`, `covered_items`, `coverage_percent`
- `coverage.threshold.checked` — Emitted after `meetsCoverageThreshold()`, includes `threshold`, `passed`
- `coverage.category.failures` — Count of per-category threshold failures from `meetsCategoryThresholds()`
- `coverage.rules.loaded` — Count of rules loaded by `loadRules()`, includes source (file vs defaults)

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-014`
- `domain`: `coverage`
- `operation`: `computeCoverage | meetsCoverageThreshold | meetsCategoryThresholds | loadRules | validateRules`
- `total_items`: Number of acceptance items evaluated
- `covered_items`: Number of items with coverage
- `coverage_percent`: Computed percentage
- `error_code`: Error code if applicable (`ERR-COV-001`, `ERR-COV-002`)

### 2.2 Log Levels

- `ERROR`: Rule file parse failures (`ERR-COV-001`), invalid input (`ERR-COV-002`)
- `WARN`: Coverage below configured threshold, category threshold failures
- `INFO`: Coverage computation completed, rules loaded
- `DEBUG`: Per-item coverage evaluation details, proof type matching

## 3. Traces

- Each `computeCoverage()` invocation is a traceable operation via the calling gate evaluation span
- No independent trace spans — coverage scoring is a synchronous, in-process computation

## 4. Alerting

- No direct alerting — coverage failures surface through gate pass/fail status
- Gate engine (FEAT-003) handles alerting on gate failures

## 5. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
