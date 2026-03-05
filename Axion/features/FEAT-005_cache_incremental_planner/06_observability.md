# FEAT-005 — Cache & Incremental Planner: Observability

## 1. Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `cache.key_computations` | counter | Number of cache keys computed via `computeKey()` |
| `cache.plan_reuse_count` | gauge | Number of stages classified as `reuse` in latest plan |
| `cache.plan_rebuild_count` | gauge | Number of stages classified as `rebuild` in latest plan |
| `cache.plan_invalidated_count` | gauge | Number of stages classified as `invalidated` in latest plan |
| `cache.integrity_checks` | counter | Number of integrity checks performed |
| `cache.integrity_corrupted` | counter | Number of corrupted entries detected |
| `cache.integrity_missing` | counter | Number of missing entries detected |
| `cache.repairs` | counter | Number of repair operations performed |

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-005`
- `domain`: `cache`
- `operation`: Function name (`computeKey`, `planIncremental`, `checkIntegrity`, `repairCache`, `buildIntegrityManifest`)
- `namespace`: Cache key namespace (when applicable)
- `stages_reused`: Count of reusable stages (for `planIncremental`)
- `stages_rebuilt`: Count of stages to rebuild (for `planIncremental`)
- `files_checked`: Number of files checked (for `checkIntegrity`)
- `files_corrupted`: Number of corrupted files found
- `error_code`: Error code if applicable (`ERR-CACHE-NNN`)

### 2.2 Log Levels

- `ERROR`: `ERR-CACHE-001` (invalid input), `ERR-CACHE-003` (infrastructure failure)
- `WARN`: `ERR-CACHE-002` (format issues), degraded mode (missing previous run)
- `INFO`: Plan generated, integrity check completed, manifest built
- `DEBUG`: Individual stage reuse/rebuild decisions, file hash computations

## 3. Traces

- Each operation generates a trace span with:
  - `span_name`: `cache.{operation}` (e.g. `cache.planIncremental`, `cache.checkIntegrity`)
  - `feature_id`: `FEAT-005`
  - `run_id`: Current pipeline run identifier (when available)

## 4. Alerting

- Alert on sustained `cache.integrity_corrupted` > 0 (potential cache poisoning)
- Alert on 100% rebuild plans for runs that should have cache hits (regression indicator)

## 5. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
