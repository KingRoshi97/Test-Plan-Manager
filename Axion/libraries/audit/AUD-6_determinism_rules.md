---
library: audit
id: AUD-6b
schema_version: 1.0.0
status: draft
---

# AUD-6b — Determinism Rules (Ops Workflow)

- audit_ops_policy registry is pinned.
- Retention class is derived from run risk class.
- Redaction/export behavior is deterministic:
 - drop deny_keys
 - strip internal refs when configured
 - preserve event ordering
- External export does not modify source audit log; it produces a derived export artifact.
