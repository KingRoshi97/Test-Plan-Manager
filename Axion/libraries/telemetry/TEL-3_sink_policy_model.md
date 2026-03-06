---
library: telemetry
id: TEL-3
schema_version: 1.0.0
status: draft
---

# TEL-3 — Telemetry Sink Policy Model

## Purpose
Define:
- where telemetry is allowed to be sent (sinks)
- what fields must be redacted
- what payload classes are forbidden

This is the safety layer for telemetry.

## Core rules
- Telemetry must never include secrets.
- Telemetry must never include full doc content (templates, canonical spec prose).
- Prefer counts + ids + hashes over raw content.
- External sinks require stricter redaction.

## Sink types (examples)
- local_file (dev)
- internal_http (internal collector)
- external_http (third-party analytics) — restricted
