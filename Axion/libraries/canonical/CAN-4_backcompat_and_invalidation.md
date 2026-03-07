---
library: canonical
id: CAN-4-GOV
title: Backward Compatibility and Invalidation
schema_version: 1.0.0
status: draft
---

# CAN-4 — Backward Compatibility and Invalidation

## Purpose

This document defines backward compatibility guarantees for canonical spec changes and provides the downstream invalidation map. When a canonical entity changes, this map identifies which artifacts become stale and which stages must re-execute.

## Backward Compatibility Rules

### Non-Breaking Changes (backward compatible)

These changes do NOT invalidate downstream artifacts:

- Adding a new optional attribute to an existing entity
- Adding a new entity that no existing artifact references
- Adding a new relationship where neither endpoint entity changed
- Updating metadata fields (timestamps, owner) without changing entity substance

### Breaking Changes (require invalidation)

These changes INVALIDATE downstream artifacts:

- Changing an `entity_id` (requires full downstream recompute)
- Removing an entity referenced by downstream artifacts
- Changing `entity_type` of an existing entity
- Modifying a `hard_fact` or `inferred_fact` value that downstream artifacts consumed
- Changing provenance class in a way that affects trust assumptions
- Removing or modifying a relationship between entities

### Versioning Contract

1. Every canonical spec version MUST be immutable once published.
2. Changes produce a new version; the old version remains accessible.
3. Version identifiers follow semantic versioning: `MAJOR.MINOR.PATCH`.
4. Breaking changes increment `MAJOR`; non-breaking additions increment `MINOR`.

## Downstream Invalidation Map

When a canonical entity changes, the following artifacts become stale:

| Canonical Change | Invalidated Artifacts | Affected Stages |
|---|---|---|
| Entity added | Template selection cache | S5 |
| Entity removed | Template selections, WBS items, filled templates, gate results, kit entries | S5, S6, S7, S8, S9 |
| Entity type changed | Template selections, WBS items, filled templates | S5, S6, S7 |
| Entity attribute changed | Filled templates, gate evaluation results | S7, S8 |
| Provenance class changed | Gate evaluation results (coverage/trust scores) | S8 |
| Relationship added | WBS dependency graph, filled templates | S6, S7 |
| Relationship removed | WBS dependency graph, filled templates, gate results | S6, S7, S8 |
| Entity ID changed | All downstream artifacts referencing the old ID | S5, S6, S7, S8, S9 |

## Stage-Specific Invalidation Details

### S5 — Template Selection

- Invalidated when: entity type, entity attributes, or entity presence changes
- Recompute scope: re-run template matching for affected entities

### S6 — Planning

- Invalidated when: entity presence, relationships, or entity type changes
- Recompute scope: regenerate WBS decomposition and acceptance criteria for affected subtrees

### S7 — Template Fill

- Invalidated when: entity attributes, relationships, or entity presence changes
- Recompute scope: re-render templates for affected entities

### S8 — Gate Evaluation

- Invalidated when: any entity or relationship change, provenance class change
- Recompute scope: re-evaluate coverage, integrity, and trust gates

### S9 — Kit Packaging

- Invalidated when: entity removed, entity ID changed
- Recompute scope: regenerate kit manifest and completeness checks

## Governance Rules

1. Every breaking canonical change MUST trigger downstream invalidation computation.
2. Invalidation results MUST be recorded in the Canonical Decision Report (CAN-2-GOV).
3. Stale artifacts MUST be marked as invalid until recomputed.
4. No downstream stage may consume a stale artifact without explicit operator override.
