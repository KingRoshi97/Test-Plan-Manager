---
library: policy
doc_id: POL-3-GOV
title: Override Expiry and Supersession
version: 1.0.0
status: draft
---

# POL-3-GOV — Override Expiry and Supersession

## Purpose

Overrides are temporary by design. This doctrine defines how overrides expire,
how policy units supersede one another, and how the system prevents stale or
orphaned governance state.

## Override Expiry

Every override MUST have an `expires_at` timestamp. The policy engine enforces:

1. **Hard expiry** — override is invalid after `expires_at`; the underlying
   policy unit is enforced again.
2. **Grace window** — a configurable period (default: 0) before expiry during
   which warnings are emitted.
3. **No auto-renewal** — expired overrides require a new approval cycle.

### Expiry Limits by Risk Class

| Risk Class  | Max Override Duration |
|-------------|----------------------|
| PROTOTYPE   | 90 days              |
| PROD        | 30 days              |
| COMPLIANCE  | 7 days               |

## Supersession

A policy unit may be **superseded** by a newer unit:

1. The new unit's `supersedes` field references the old unit's `unit_id`.
2. The old unit transitions to `superseded` status.
3. Active overrides on the old unit do NOT carry over — they must be re-approved
   against the new unit if still needed.
4. Decision reports reference both the superseding and superseded units for
   traceability.

## Conflict Resolution

When multiple units apply to the same scope:

1. **Specificity wins** — a unit scoped to a single gate beats one scoped to all
   gates.
2. **Strictest wins** — when specificity is equal, the stricter constraint
   prevails.
3. **Explicit over implicit** — an explicit `skip` directive beats an inherited
   default.

## Garbage Collection

- Superseded units are retained for audit but excluded from evaluation after
  a configurable retention period (default: 180 days).
- Expired overrides are archived, not deleted.
