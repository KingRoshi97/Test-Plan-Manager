---
library: canonical
id: CAN-0
schema_version: 1.0.0
status: draft
---

# CAN-0 — canonical/ Purpose + Boundaries

## Purpose
`canonical/` defines the **Canonical Spec contract**: the single source of truth built from
normalized intake + resolved standards. It provides:
- a consistent, normalized representation of the target system
- stable entity identifiers and relationships
- reference integrity rules
- a formal model for unknowns/assumptions
- constraints that downstream stages rely on (templates, planning, verification)

## What it governs (in scope)
- Canonical Spec entity model (what entities exist, minimum fields)
- Relationship model (how entities reference each other)
- ID rules (stable, deterministic ID generation and normalization)
- Reference integrity rules (no dangling refs, consistent naming)
- Unknowns/assumptions artifact model (captured explicitly)
- Canonical build invariants and validation rules

## What it does NOT govern (out of scope)
- Intake forms and normalization rules → `intake/`
- Which standards apply and how they're resolved → `standards/`
- Gate DSL semantics → `gates/`
- Pipeline ordering, stage reports, run manifest → `orchestration/`
- Template registry/selection/render rules → `templates/`
- Planning artifacts (WBS, acceptance map) → `planning/`
- Proof ledger and verification rules → `verification/`
- Workspace/pins/adapters/quotas → `system/`
- Risk classes and overrides → `policy/`
- Knowledge items (library content) → `knowledge/`

## Consumers
- Template selection (S5)
- Planning (S6)
- Template fill (S7)
- Gate evaluation (S8) for coverage/integrity checks
- Kit packaging (S9) for final deliverable completeness

## Determinism requirements
- Canonical spec is a pure function of:
  - NORMALIZED_INPUT
  - STANDARDS_SNAPSHOT
  - canonical build rules (this library, pinned)
- IDs are stable and reproducible.
- Unknowns are explicit and do not hide inside free text.
