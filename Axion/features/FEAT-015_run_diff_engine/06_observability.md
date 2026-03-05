# FEAT-015 — Run Diff Engine: Observability

## 1. Metrics

- `diff.comparisons.total` — Number of `diffRuns()` invocations
- `diff.entries.total` — Total entries in the most recent report
- `diff.changes.added` — Count of added files
- `diff.changes.removed` — Count of removed files
- `diff.changes.modified` — Count of modified files
- `diff.changes.unchanged` — Count of unchanged files
- `diff.duration_ms` — Time to complete a full `diffRuns()` call
- `diff.classify.duration_ms` — Time to complete `classifyChanges()`

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-015`
- `domain`: `diff`
- `operation`: `diffRuns` | `classifyChanges` | `classifySingleChange`
- `previous_run_id`: Baseline run identifier
- `current_run_id`: Comparison run identifier
- `status`: `success` | `failure`
- `error_code`: Error code if applicable (`ERR-DIFF-001`, `ERR-DIFF-002`)

### 2.2 Log Levels

- `ERROR`: Directory not found or not a directory
- `INFO`: Diff completed with summary counts
- `DEBUG`: Per-file hash computation and classification details

## 3. Traces

- Each `diffRuns()` call generates a trace span:
  - `span_name`: `diff.diffRuns`
  - `feature_id`: `FEAT-015`
  - `previous_run_id`, `current_run_id`

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
