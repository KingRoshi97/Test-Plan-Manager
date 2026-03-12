---
library: standards
doc_id: STD-1_standards_unit_model
title: Standards Unit Model
version: 1.0.0
status: draft
---

# STD-1 — Standards Unit Model

## Purpose

Defines the governed unit abstraction for every standard in the Axion system. Each standard is a first-class governed unit with a stable identifier, version, lifecycle status, applicability predicates, dependency edges, and deprecation/supersession chain.

## Unit Identity

Every standard unit MUST carry:

| Field | Type | Description |
|---|---|---|
| `unit_id` | string | Stable identifier, pattern `^STDU-[A-Z0-9_\-]+$`. Immutable once assigned. |
| `name` | string | Human-readable name. |
| `version` | string | SemVer string (`MAJOR.MINOR.PATCH`). |
| `status` | enum | One of: `draft`, `active`, `deprecated`, `superseded`, `retired`. |
| `created_at` | datetime | ISO-8601 creation timestamp. |
| `updated_at` | datetime | ISO-8601 last-modified timestamp. |
| `owner` | string | Responsible party or team. |

## Lifecycle States

```
draft ──► active ──► deprecated ──► retired
                  └──► superseded (by successor unit_id)
```

- **draft**: Under development; not enforced.
- **active**: Enforced in applicable contexts.
- **deprecated**: Still enforced but scheduled for removal; consumers should migrate.
- **superseded**: Replaced by a successor unit; enforcement transfers to successor.
- **retired**: No longer enforced; kept for audit trail only.

## Applicability Predicates

Each unit declares predicates that determine where it applies:

| Predicate | Type | Description |
|---|---|---|
| `profiles` | string[] | Run profiles where the standard applies (e.g., `PROFILE-API`). |
| `risk_classes` | string[] | Risk classes (e.g., `PROTOTYPE`, `PROD`, `COMPLIANCE`). |
| `stacks` | string[] | Technology families (e.g., `react`, `node`). Optional. |
| `domains` | string[] | Canonical domains (e.g., `auth`, `payments`). Optional. |
| `exclusions` | string[] | Contexts explicitly excluded. Optional. |

A standard applies when ALL non-empty predicate arrays have at least one match against the current context.

## Dependency Edges

Each unit declares typed edges to other governed artifacts:

| Edge Type | Target | Description |
|---|---|---|
| `gate` | Gate ID | Gates that enforce this standard. |
| `template` | Template ID | Templates that implement this standard. |
| `proof` | Proof type ID | Proof artifacts required to satisfy this standard. |
| `pack` | Pack ID | Parent standards pack containing this unit. |
| `requires` | Unit ID | Other standard units this unit depends on. |

Edges are declared as an array of `{ edge_type, target_id, description }` objects.

## Deprecation and Supersession Chain

When a standard is superseded:

1. The original unit's status transitions to `superseded`.
2. The `superseded_by` field references the successor `unit_id`.
3. The successor unit's `supersedes` field references the predecessor `unit_id`.
4. Both units remain in the registry; the predecessor is never deleted.
5. A `migration_path` field on the successor describes how consumers transition.

Chain traversal: Given any unit, walk `superseded_by` links to find the current active unit. Walk `supersedes` links to find the full history.

## Validation Rules

1. `unit_id` MUST be unique across the entire standards registry.
2. `version` MUST follow SemVer.
3. A unit in `active` status MUST have at least one applicability predicate populated.
4. A unit in `superseded` status MUST have a non-empty `superseded_by` field.
5. Dependency edges MUST reference valid target IDs that exist in their respective registries.
6. Circular supersession chains are forbidden.

## Schema Reference

Governed by `axion://SYSTEM/contracts/standards_unit.v1`.
