---
library: ops
id: OPS-2
section: logging_tracing_model
schema_version: 1.0.0
status: draft
---

# OPS-2 — Logging & Tracing Standards

## Overview
The logging and tracing model defines the required structure of every log line emitted by
the Axion pipeline, the correlation identifiers that link log entries across stages, and
the redaction policy that prevents secrets or PII from appearing in logs.

## Required Log Fields

Every log line must include the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `ts` | ISO 8601 string | yes | Timestamp of the log entry |
| `level` | enum | yes | `debug`, `info`, `warn`, `error` |
| `message` | string | yes | Human-readable log message |
| `run_id` | string | yes | Identifier of the current run |
| `stage_id` | string | yes | Pipeline stage that emitted the log |
| `gate_id` | string | conditional | Gate ID if log is from gate evaluation |
| `artifact_id` | string | conditional | Artifact ID if log relates to an artifact |
| `trace_id` | string | yes | Distributed trace identifier |
| `span_id` | string | yes | Span within the trace |

## Log Levels

- **debug**: Verbose diagnostic information. Suppressed in production runs unless profiling is enabled.
- **info**: Normal operational events (stage started, gate passed, artifact stored).
- **warn**: Anomalies that do not halt the pipeline but should be reviewed.
- **error**: Failures that halt or degrade the pipeline run.

## Correlation IDs

All log entries within a single run share the same `run_id` and `trace_id`. Each stage
creates a child `span_id`. This enables:
- Filtering all logs for a single run.
- Tracing execution flow across pipeline stages.
- Correlating gate evaluation logs with the artifacts they inspected.

## Redaction Policy

Before a log line is persisted or transmitted, it must pass through the redaction filter:
- Patterns matching AWS access keys (`AKIA[0-9A-Z]{16}`) are replaced with `[REDACTED]`.
- Patterns matching private key blocks are replaced with `[REDACTED]`.
- Patterns matching `password` or `token` assignments are replaced with `[REDACTED]`.
- Custom patterns may be added to the redaction list without changing the log schema.

## Constraints
- No secrets may appear in logs (enforced by redaction).
- All log lines must include `run_id` for traceability.

## Reference Data
Existing logging and tracing standards are defined in `registries/LTS-01.logging_tracing_standards.v1.json`.

## Relationship to Other Sections
- **OPS-1 (Monitoring & Alerts)**: Alert evaluations produce log entries that conform to this model.
- **OPS-6 (Ops Gates)**: Gate evaluation logs must include `gate_id` for correlation.
