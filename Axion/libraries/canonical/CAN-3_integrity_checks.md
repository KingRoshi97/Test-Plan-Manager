---
library: canonical
id: CAN-3a
schema_version: 1.0.0
status: draft
---

# CAN-3a — Integrity Checks

## CAN-INTEGRITY-01 Relationship endpoints exist
For every relationship:
- from must reference an existing entity_id
- to must reference an existing entity_id

## CAN-INTEGRITY-02 Relationship type compatibility
For every relationship:
- entity(from).type must be allowed for rel.type
- entity(to).type must be allowed for rel.type
(using relationship_constraints registry)

## CAN-INTEGRITY-03 Attribute refs are valid
If an entity attribute contains references like:
- owner_entity_id
- component_id
- data_entity_id
- endpoint_id
then each must reference a valid entity_id.
(Implementation: maintain a list of ref-like attribute keys or annotate schemas per entity type
later.)

## CAN-INTEGRITY-04 Uniqueness constraints
- endpoint canonical keys must be unique: (method + path)
- component name_slug must be unique within project scope
- data_entity name_slug must be unique within project scope

## CAN-INTEGRITY-05 Unknowns recorded, not hidden
If an entity requires a field but it's missing/ambiguous:
- do not invent silently
- record as UNKNOWN_ASSUMPTIONS entry
