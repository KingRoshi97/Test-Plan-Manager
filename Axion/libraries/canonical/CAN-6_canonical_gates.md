---
library: canonical
id: CAN-6
schema_version: 1.0.0
status: draft
---

# CAN-6 — Canonical Gates

## Purpose
Enforce that the Canonical Spec is internally consistent and usable by downstream stages.

## Gate set (minimum)

### CAN-GATE-01 — Canonical spec schema valid
- CANONICAL_SPEC validates against canonical_spec.v1

### CAN-GATE-02 — ID integrity
- entity_id unique
- rel_id unique
- IDs follow patterns and are stable per CAN-2 rules (where enforceable)

### CAN-GATE-03 — Relationship integrity
- all relationships from/to exist in entities (CAN-INTEGRITY-01)

### CAN-GATE-04 — Relationship type compatibility
- relationship types comply with relationship_constraints registry (CAN-INTEGRITY-02)

### CAN-GATE-05 — Uniqueness constraints
- endpoints unique by (method + path)
- components unique by name_slug (project scope)
- data_entities unique by name_slug (project scope)

### CAN-GATE-06 — Unknowns handling
- UNKNOWN_ASSUMPTIONS exists
- blocking unknowns behavior is risk-class dependent:
  - PROTOTYPE: allowed but recorded
  - PROD/COMPLIANCE: may block unless overridden (policy set decides)

## Output
- Canonical build report (optional) should summarize counts and unknown severity.
