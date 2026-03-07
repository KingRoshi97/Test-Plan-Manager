---
library: canonical
id: CAN-1-GOV
title: Canonical Unit Model
schema_version: 1.0.0
status: draft
---

# CAN-1 — Canonical Unit Model

## Purpose

Every canonical entity is a **governed unit**. This document defines the structure and governance contract for each unit, including its identity, provenance classification, and downstream dependency map.

## Canonical Unit Structure

Each governed canonical unit contains the following properties:

| Field | Type | Required | Description |
|---|---|---|---|
| `entity_id` | string | yes | Stable deterministic identifier (pattern: `E-[A-Z0-9]{6,}`) |
| `entity_type` | string | yes | One of the canonical entity types defined in the entity model |
| `name` | string | yes | Human-readable name for the entity |
| `provenance_class` | enum | yes | One of: `hard_fact`, `inferred_fact`, `unresolved_unknown` |
| `provenance_source` | string | yes | Origin reference (intake field path, standard ref, or inference rule) |
| `downstream_dependencies` | array | yes | List of artifact paths or stage references that consume this unit |
| `last_resolved_at` | datetime | yes | Timestamp of last resolution or provenance assignment |
| `resolution_version` | string | yes | Version of the resolution rules applied |

## Provenance Classes

| Class | Definition |
|---|---|
| `hard_fact` | Directly sourced from validated intake data or authoritative standard; no inference involved |
| `inferred_fact` | Derived through deterministic rules from one or more hard facts; traceable inference chain |
| `unresolved_unknown` | Cannot be classified as fact; requires operator input, additional intake, or escalation |

## Downstream Dependencies

Each canonical unit declares which downstream artifacts depend on it:

- **Template selection** (S5): Entity type and attributes drive template matching
- **Planning** (S6): WBS decomposition, acceptance criteria mapping
- **Template fill** (S7): Entity values populate template variables
- **Gate evaluation** (S8): Coverage and integrity checks reference entity state
- **Kit packaging** (S9): Final deliverable completeness depends on entity presence

## Governance Rules

1. Every entity in the canonical spec MUST have an assigned `provenance_class`.
2. No entity may exist without at least one `downstream_dependency` declared.
3. Entities with `provenance_class: unresolved_unknown` MUST be surfaced in gate reports.
4. Provenance assignments are immutable within a resolution version; changes require a new version.
5. The canonical unit schema (`canonical_unit.v1.schema.json`) validates all governed units.

## Schema Reference

- Validation schema: `axion://schemas/canonical/canonical_unit.v1`
- Registry: `canonical_registry.v1.json`
