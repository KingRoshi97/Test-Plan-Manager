# FEAT-013 — Ref Integrity Engine: Observability

## 1. Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `refs.extracted.count` | counter | Total references extracted per invocation |
| `refs.resolved.count` | counter | References successfully resolved |
| `refs.unresolved.count` | counter | References that failed to resolve |
| `refs.graph.nodes` | gauge | Number of nodes in reference graph |
| `refs.graph.edges` | gauge | Number of edges in reference graph |
| `refs.cycles.detected` | counter | Number of cycles detected |
| `refs.validation.all_valid` | boolean | Whether all references resolved |

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-013`
- `domain`: `refs`
- `operation`: `extractRefs` | `extractRefsFromSpec` | `extractRefsFromTemplate` | `resolveRefs` | `validateRefIntegrity` | `buildGraph` | `detectCycles` | `topologicalSort`
- `ref_count`: Number of refs processed
- `status`: success | failure

### 2.2 Log Levels

- `ERROR`: Unresolved required references, unexpected exceptions
- `WARN`: Refs resolved via fallback (collection scan instead of index)
- `INFO`: Extraction/resolution/graph operation completed
- `DEBUG`: Individual ref extraction and resolution details

## 3. Traces

- Each pipeline invocation generates a trace span:
  - `span_name`: `refs.{operation}`
  - `feature_id`: `FEAT-013`
  - `run_id`: Current pipeline run identifier
  - `ref_count`: Number of refs in scope

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
