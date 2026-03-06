---
library: telemetry
id: TEL-0
schema_version: 1.0.0
status: draft
---

# TEL-0 — telemetry/ Purpose + Boundaries

## Purpose
`telemetry/` defines Axion's **event and metrics contracts**:
- what events exist (event types + required fields)
- what run metrics exist (durations, counts, cost signals)
- where telemetry is allowed to be sent (sink policies)
- privacy/safety constraints for telemetry payloads

Telemetry helps measure pipeline health without changing pipeline semantics.

## What it governs (in scope)
- Telemetry event schemas (per event type)
- Run metrics schema (aggregate metrics per run/stage)
- Telemetry sink policy (allowed destinations, redaction rules)

## What it does NOT govern (out of scope)
- Operational monitoring/alert thresholds → `ops/`
- Logging/tracing standards → `ops/`
- Gate DSL → `gates/`
- Orchestration mechanics → `orchestration/`

## Consumers
- Pipeline runtime (emits events)
- Operator UI (dashboards, run summaries)
- Cost modeling (ops) (reads telemetry)

## Determinism requirements
- Telemetry must not affect run outcomes (no feedback loops in core path).
- Event schemas are versioned and pinned for compatibility.
