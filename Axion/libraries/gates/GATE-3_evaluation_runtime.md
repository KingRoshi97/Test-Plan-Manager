---
library: gates
id: GATE-3
section: evaluation_runtime
schema_version: 1.0.0
status: draft
---

# GATE-3 — Evaluation Runtime

## Overview
The gate evaluation runtime is the engine that executes gate definitions against a run's
artifacts and state. It processes predicates, collects evidence, emits traces, and produces
gate reports.

## Evaluation Flow

```
Gate Definition → Load Predicates → Resolve Context → Evaluate Predicates → Collect Evidence → Emit Report
```

### 1. Load Gate Definition
- Read the gate definition from the gate registry.
- Validate the definition (GATE-1 validation).
- Validate all predicate expressions (GATE-2 validation).

### 2. Resolve Evaluation Context
The evaluation context contains all inputs needed to evaluate predicates:
- `run_id`: Current run identifier
- `stage_id`: Current stage identifier
- `artifacts`: Map of artifact paths to their content/metadata
- `manifest`: Current run manifest snapshot
- `evidence`: Previously collected evidence from earlier gates

### 3. Evaluate Predicates
For each predicate in the gate definition:
1. Evaluate the predicate against the context.
2. Record the result (pass/fail) and any evidence.
3. If the predicate fails and severity is `blocker`, halt evaluation (no subsequent predicates are evaluated).
4. If severity is `warning`, continue evaluation but record the warning.

### 4. Short-Circuit Rules
- **blocker** gates: First predicate failure stops evaluation. Remaining predicates are not evaluated.
- **warning** gates: All predicates are evaluated regardless of individual failures.

### 5. Trace Emission
When trace mode is enabled (`trace_mode: true` in the eval request), the runtime emits a
predicate-by-predicate execution trace conforming to `gate_eval_trace.v1.schema.json`.

## Eval Request Format
```json
{
  "run_id": "run_abc123",
  "gate_id": "G1_INTAKE_VALIDITY",
  "context_refs": {
    "manifest": ".axion/runs/run_abc123/run_manifest.json",
    "artifacts": ".axion/runs/run_abc123/artifacts/"
  },
  "trace_mode": false
}
```

## Error Handling
- **Missing artifact**: Predicate returns `fail` with failure code `E_FILE_MISSING`.
- **Invalid JSON**: Predicate returns `fail` with failure code `E_JSON_INVALID`.
- **Unknown operator**: Predicate returns `fail` with failure code `E_UNKNOWN_OP`.
- **Evaluation error**: Predicate returns `fail` with failure code `E_EVAL_ERROR` and error details.

## Concurrency
- Gate evaluation is single-threaded per gate.
- Multiple gates for the same stage are evaluated sequentially.
- Gates across different stages are never evaluated concurrently (pipeline is sequential).
