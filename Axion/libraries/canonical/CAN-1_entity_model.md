---
library: canonical
id: CAN-1
schema_version: 1.0.0
status: draft
---

# CAN-1 — Canonical Spec Entity Model

## Purpose
Define the minimum canonical entities and relationship structures that downstream stages can
rely on.

## Canonical Spec = entity graph
The canonical spec is a graph of entities with stable IDs and typed relationships.

## Minimum entity types (baseline)
- project
- domain
- capability
- component
- data_entity
- endpoint
- integration
- workflow
- requirement
- constraint
- risk

You can expand this list later, but these form a stable minimum set for planning + templates.

## Relationship types (baseline)
- contains (parent → child)
- depends_on (entity → entity)
- exposes (component → endpoint)
- stores (component → data_entity)
- integrates_with (component → integration)
- satisfies (component/workflow → requirement)
- constrained_by (any → constraint)
