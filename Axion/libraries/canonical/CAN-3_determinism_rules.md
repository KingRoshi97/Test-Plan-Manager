---
library: canonical
id: CAN-3b
schema_version: 1.0.0
status: draft
---

# CAN-3b — Determinism Rules (Integrity)

- Integrity checks run in fixed order CAN-INTEGRITY-01..05.
- Failures are sorted deterministically (by entity_id / rel_id).
- Constraints registry is pinned via system pins.
- Unknowns are emitted as explicit unknown records, not inline notes.
