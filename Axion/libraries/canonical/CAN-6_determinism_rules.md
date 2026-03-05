---
library: canonical
id: CAN-6d
schema_version: 1.0.0
status: draft
---

# CAN-6d — Determinism Rules (Canonical Gates)

- Canonical gates run in fixed order CAN-GATE-01..06.
- Failure lists are deterministically ordered (entity_id/rel_id sorted).
- Policy-controlled behavior must be based on pinned risk_class + policy_set decision.
