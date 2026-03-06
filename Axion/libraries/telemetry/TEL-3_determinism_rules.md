---
library: telemetry
id: TEL-3a
schema_version: 1.0.0
status: draft
---

# TEL-3a — Determinism Rules (Telemetry Sinks)

- Sink selection is derived from pinned sink policy registry.
- Redaction is applied deterministically:
  - remove deny_keys anywhere in payload (deep traversal)
  - remove/replace values matching deny_patterns
- External sinks require external_strict_mode == true:
  - drop any event with unknown payload keys (optional strict behavior)
  - enforce minimal payload whitelist per event_type (if implemented later)
