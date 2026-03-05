---
library: system
id: SYS-3b
schema_version: 1.0.0
status: draft
---

# SYS-3b — Validation Checklist

- [ ] capabilities registry matches capability_registry schema
- [ ] adapter profile matches adapter_profile schema
- [ ] adapter profile capability IDs exist in capabilities registry
- [ ] command policy matches command_policy schema
- [ ] deny patterns override allow patterns
- [ ] run manifest pins adapter_profile_id and records resolved snapshot
