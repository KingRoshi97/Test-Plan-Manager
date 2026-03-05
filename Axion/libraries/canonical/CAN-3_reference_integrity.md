---
library: canonical
id: CAN-3
schema_version: 1.0.0
status: draft
---

# CAN-3 — Reference Integrity Rules

## Purpose
Ensure the canonical spec graph is internally consistent:
- no dangling references
- relationship endpoints exist
- entity attributes that reference other entities use valid IDs
- consistent tenancy scoping if you include it

## Integrity surfaces
1) Relationship integrity (from/to exist)
2) Attribute reference integrity (attributes contain valid entity_id references)
3) Type compatibility (relationship type matches entity types)
4) Uniqueness constraints (no duplicate endpoints, etc.)
