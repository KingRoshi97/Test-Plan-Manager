---
library: telemetry
id: TEL-2
schema_version: 1.0.0
status: draft
---

# TEL-2 — Run Metrics Model

## Purpose
Define deterministic aggregate metrics for:
- whole runs
- stages
- gates

These metrics support operator visibility and cost/perf analysis.

## Metric categories (minimum)
- timing: durations per stage and total
- counts: artifacts produced, templates selected, proofs recorded
- outcomes: pass/fail per gate, final run status
- resource signals (optional): tokens, cost, compute time

## Design rules
- Metrics are derived from pinned run artifacts/events.
- Metrics output is small and structured.
