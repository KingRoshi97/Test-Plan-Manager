---
library: telemetry
id: TEL-1
schema_version: 1.0.0
status: draft
---

# TEL-1 — Telemetry Event Model

## Purpose
Define a base event structure that all telemetry events share so event ingestion is uniform.

## Base event fields (minimum)
- event_id
- event_type
- schema_version
- run_id
- stage_id (optional for run-wide events)
- timestamp
- payload (event-specific fields)

## Design rule
Event payload must be safe-by-default:
- no secrets
- no raw user PII
- no full document content
Use references/ids + redaction rules.
