---
library: kit
id: KIT-5c
schema_version: 1.0.0
status: draft
---

# KIT-5c — Evidence Requirements (Kit Failures)

On failure, evidence must include:
- missing required folders/files (paths)
- manifest validation errors (field pointers)
- missing contract_ids (list)
- files on disk not present in manifest (if strict)
- policy decision refs for external export deny/approval
- remediation:
  - rebuild kit
  - fix manifest generation
  - fix classification tags
  - re-run S9
