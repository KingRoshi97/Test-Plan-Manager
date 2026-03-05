---
library: system
id: SYS-5b
schema_version: 1.0.0
status: draft
---

# SYS-5b — Validation Checklist

- [ ] event types registry matches schema
- [ ] destinations registry matches schema
- [ ] routes registry matches schema
- [ ] routes reference existing destination_ids
- [ ] throttle mode and dedupe key are valid
- [ ] routing is deterministic (order preserved, stable output)
