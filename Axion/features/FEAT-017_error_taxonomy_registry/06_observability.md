# FEAT-017 — Error Taxonomy & Registry: Observability

## 1. Metrics

- `taxonomy.registry_loaded` — Counter, incremented each time a registry is successfully loaded
- `taxonomy.registry_load_errors` — Counter, incremented on registry load failures
- `taxonomy.lookups_total` — Counter, total `lookupErrorCode()` calls
- `taxonomy.lookups_miss` — Counter, lookups that returned `undefined`
- `taxonomy.normalizations_total` — Counter, total `normalizeError()` calls
- `taxonomy.normalizations_unclassified` — Counter, `normalizeUnknownError()` calls (errors without registry match)

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-017`
- `domain`: `taxonomy`
- `operation`: Function name (`loadErrorRegistry`, `lookupErrorCode`, `normalizeError`, etc.)
- `error_code`: The ERR-TAX-NNN code when an error occurs
- `registry_version`: Version string from the loaded registry

### 2.2 Log Levels

- `ERROR`: Registry load failures (ERR-TAX-001 through ERR-TAX-009)
- `WARN`: Lookup misses (code not found in registry), unclassified error normalization
- `INFO`: Registry loaded successfully with entry count
- `DEBUG`: Individual lookup and normalization operations

## 3. Traces

- Each `loadErrorRegistry()` call generates a trace span: `taxonomy.loadErrorRegistry`
- Each `normalizeError()` call generates a trace span: `taxonomy.normalizeError`
- Span attributes: `feature_id=FEAT-017`, `registry_version`, `error_code`

## 4. Alerting

- Alert when `taxonomy.registry_load_errors` exceeds 0 in a pipeline run (registry must load successfully)
- Alert when `taxonomy.normalizations_unclassified` rate exceeds a configurable threshold (indicates missing error definitions)

## 5. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
