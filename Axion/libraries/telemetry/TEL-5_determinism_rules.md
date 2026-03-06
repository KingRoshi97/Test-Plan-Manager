---
library: telemetry
id: TEL-5b
schema_version: 1.0.0
status: draft
---

# TEL-5b — Determinism Rules (Telemetry Gates)

- Registry and sink policy are pinned.
- Redaction algorithm is deterministic (same input → same output).
- Gate evaluation order is fixed TEL-GATE-01..05.
- Telemetry failures default to warn; strict mode is policy controlled.
