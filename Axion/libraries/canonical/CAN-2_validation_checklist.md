---
library: canonical
id: CAN-2d
schema_version: 1.0.0
status: draft
---
# CAN-2d — Validation Checklist

- [ ] id_rules registry exists (if used) and is pinned
- [ ] all entities have deterministic canonical_key generation
- [ ] entity_id and rel_id are deterministic and stable on rerun
- [ ] dedupe merges do not silently overwrite conflicts
- [ ] conflicts create UNKNOWN_ASSUMPTIONS entries
