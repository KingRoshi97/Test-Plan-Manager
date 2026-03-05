# FEAT-004 — Artifact Store & Registry: Observability

## 1. Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `cas.put.count` | counter | Number of `put()` calls |
| `cas.put.deduplicated` | counter | Puts skipped because hash already existed |
| `cas.get.count` | counter | Number of `get()` calls |
| `cas.get.miss` | counter | Gets returning `null` |
| `cas.objects.total` | gauge | Total objects in store (from `list()`) |
| `refs.set.count` | counter | Named refs created/updated |
| `refs.delete.count` | counter | Named refs deleted |
| `gc.scanned` | gauge | Objects scanned in last GC run |
| `gc.removed` | gauge | Objects removed in last GC run |
| `gc.freed_bytes` | gauge | Bytes freed in last GC run |
| `gc.errors` | gauge | Errors encountered in last GC run |

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-004`
- `domain`: `artifact-store`
- `module`: `cas` | `refs` | `gc`
- `operation`: Function name (`put`, `get`, `garbageCollect`, etc.)
- `hash`: Content hash (for CAS operations)
- `ref_name`: Reference name (for ref operations)
- `status`: success | failure

### 2.2 Log Levels

- `ERROR`: Filesystem failures, GC removal errors
- `WARN`: Inline ref resolution attempted
- `INFO`: GC completed with summary stats
- `DEBUG`: Individual put/get/delete operations

## 3. Traces

- Each CAS operation generates a trace span:
  - `span_name`: `artifact-store.{operation}`
  - `feature_id`: `FEAT-004`
  - `hash`: Content hash when applicable

## 4. Alerting

- Alert on GC `errors.length > 0` (removal failures)
- Alert on sustained `cas.get.miss` rate (possible reference corruption)

## 5. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
