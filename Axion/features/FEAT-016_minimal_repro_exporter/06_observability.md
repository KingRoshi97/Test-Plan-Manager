# FEAT-016 — Minimal Repro Exporter: Observability

## 1. Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `repro.selection.artifacts_selected` | gauge | Number of artifacts selected per invocation |
| `repro.selection.artifacts_excluded` | gauge | Number of artifacts excluded per invocation |
| `repro.selection.total_size_bytes` | gauge | Total size of selected artifacts in bytes |
| `repro.package.artifacts_included` | gauge | Number of artifacts actually copied into package |
| `repro.package.content_hash` | label | Content hash of the built package |

## 2. Logging

### 2.1 CLI Output (cmdRepro)

The CLI command logs structured progress messages to stdout:

- `[repro] Selecting artifacts from: {runDir}`
- `[repro] Selected {N} artifacts ({M} excluded)`
- `[repro] Building repro package at: {outputPath}`
- `[repro] Repro package created:` followed by `repro_id`, `run_id`, `artifacts`, `hash`, `output`

### 2.2 Error Output

- `ERR-REPRO-001` → stderr + `process.exit(1)` in CLI mode

### 2.3 Structured Log Fields

- `feature`: `FEAT-016`
- `domain`: `repro`
- `operation`: `select` | `build` | `cli`
- `run_id`: Current run identifier
- `repro_id`: Generated repro package identifier

## 3. Traces

- `repro.select` — artifact selection phase
- `repro.build` — package assembly phase
- `repro.cli` — full CLI invocation

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
