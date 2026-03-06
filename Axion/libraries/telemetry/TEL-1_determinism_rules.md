---
library: telemetry
id: TEL-1a
schema_version: 1.0.0
status: draft
---

# TEL-1a — Determinism Rules (Events)

- event_type must exist in telemetry_event_types registry (strict mode).
- base event schema is pinned per run version.
- telemetry emission must not affect run decisions (fire-and-forget).
- payload must comply with sink redaction rules (TEL-3).
