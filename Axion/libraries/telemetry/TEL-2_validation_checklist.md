---
library: telemetry
id: TEL-2b
schema_version: 1.0.0
status: draft
---

# TEL-2b — Validation Checklist

- [ ] run_metrics validates against schema
- [ ] durations are non-negative and consistent
- [ ] stage/gate ordering is deterministic
- [ ] token/cost fields omitted if unavailable (no fake data)
