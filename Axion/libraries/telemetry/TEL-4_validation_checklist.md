---
library: telemetry
id: TEL-4c
schema_version: 1.0.0
status: draft
---

# TEL-4c — Validation Checklist (Privacy)

- [ ] telemetry_privacy_policy schema exists and validates
- [ ] deny_keys + deny_patterns cover secrets
- [ ] free-text rules are explicit (allowlist + max chars)
- [ ] external sinks block free-text by default
- [ ] no content dumps are allowed
