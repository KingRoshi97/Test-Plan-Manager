---
library: verification
id: VER-5b
schema_version: 1.0.0
status: draft
---

# VER-5b — Validation Checklist

- [ ] verification_command_policy validates against schema
- [ ] rule evaluation order is deterministic (first match wins)
- [ ] deny patterns are present for destructive commands
- [ ] policy is pinned per run
- [ ] require_approval integrates with policy hooks + audit
