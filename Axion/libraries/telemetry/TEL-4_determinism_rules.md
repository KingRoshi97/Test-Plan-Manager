---
library: telemetry
id: TEL-4b
schema_version: 1.0.0
status: draft
---

# TEL-4b — Determinism Rules (Privacy)

- Privacy policy registry is pinned.
- Redaction is deterministic (same input → same output).
- External sink policy is stricter than internal.
- If a payload violates policy after redaction:
 - internal sinks: drop violating fields and emit reduced event
 - external sinks: block event emission
