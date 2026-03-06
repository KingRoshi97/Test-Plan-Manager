---
library: telemetry
id: TEL-3b
schema_version: 1.0.0
status: draft
---

# TEL-3b — Validation Checklist

- [ ] telemetry_sink_policy validates against schema
- [ ] deny_keys and deny_patterns exist and cover secrets
- [ ] external sinks disabled by default
- [ ] redaction is deterministic and applied before routing
- [ ] telemetry never includes full doc content
