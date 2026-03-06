---
library: audit
id: AUD-1a
schema_version: 1.0.0
status: draft
---

# AUD-1a — Determinism Rules (Audit Actions)

- audit_event_id is stable and unique.
- action_type is a closed enum.
- refs use stable ids/paths only.
- Sensitive actions require reason:
  - override_requested
  - override_approved
  - override_denied
  - stage_rerun_requested
  - export_requested
  - export_approved
  - export_denied
  - manual_attestation_recorded
- actor.role is normalized to the closed enum set.
