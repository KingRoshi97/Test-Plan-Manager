---
library: knowledge
id: KNO-3
section: freshness_supersession
schema_version: 1.0.0
status: draft
---

# KNO-3 — Freshness & Supersession

## Overview
Knowledge items (KIDs) have a limited shelf life. Technology, regulations, and best practices evolve, and knowledge that was accurate at creation may become stale or incorrect. This document defines how freshness is measured, when staleness is detected, how supersession chains are managed, and how version lineage is tracked.

## Freshness Windows

| Authority Tier | Default Freshness Window | Review Trigger |
|---------------|-------------------------|----------------|
| **Golden** | 12 months | Automatic review scheduled at 10 months. |
| **Verified** | 6 months | Automatic review scheduled at 5 months. |
| **Reviewed** | 3 months | Automatic review scheduled at 2.5 months. |
| **Draft** | 1 month | No automatic review; manual promotion expected. |

Freshness is measured from the KID's `updated_at` timestamp. A KID is considered **fresh** if `now - updated_at < freshness_window`.

## Staleness Detection
- A KID is **stale** when `now - updated_at >= freshness_window`.
- Stale KIDs are flagged in the knowledge registry with `freshness_status: stale`.
- Stale KIDs receive a scoring penalty during retrieval (KNO-4).
- Stale KIDs at `golden` or `verified` tier trigger an operator notification.
- A KID that remains stale for 2x its freshness window is automatically demoted one authority tier.

## Staleness Actions

| Staleness Duration | Action |
|-------------------|--------|
| 1x freshness window | Flag as stale, apply retrieval penalty. |
| 1.5x freshness window | Surface in operator dashboard, block new golden/verified promotions. |
| 2x freshness window | Auto-demote one authority tier, notify owner. |
| 3x freshness window | Mark as `needs_review`, exclude from standard+ risk class runs. |

## Supersession Chains
When a KID is replaced by a newer version or a different KID, a **supersession** relationship is recorded:
- The old KID sets `superseded_by: <new_kid_id>`.
- The new KID sets `supersedes: <old_kid_id>`.
- Superseded KIDs are excluded from retrieval results; queries transparently resolve to the superseding KID.
- Supersession is transitive: if A is superseded by B, and B is superseded by C, then queries for A resolve to C.

## Supersession Rules
1. A KID may only be superseded by exactly one other KID (no fan-out).
2. A KID may supersede multiple other KIDs (fan-in is allowed).
3. Supersession chains must be acyclic — circular supersession is a validation error.
4. The superseding KID must have equal or higher authority tier than the superseded KID.
5. Supersession is recorded with timestamp, actor, and justification.

## Version Lineage
- Every KID has a `version` field following semver (MAJOR.MINOR.PATCH).
- MAJOR: breaking changes to the KID's core claims or classification.
- MINOR: additions or clarifications that do not contradict existing content.
- PATCH: typo fixes, formatting, metadata corrections.
- Version history is maintained in the KID's changelog or the knowledge registry's audit trail.

## Determinism Rules
- Freshness evaluation is deterministic given the same `updated_at` timestamp and freshness window.
- Supersession chain resolution is deterministic: always follow `superseded_by` links to the terminal (non-superseded) KID.
- Staleness actions are deterministic given the same staleness duration and policy thresholds.
- Version comparison follows semver rules deterministically.

## Validation Checklist
- [ ] Every KID has a valid `updated_at` timestamp
- [ ] Freshness windows are defined per authority tier
- [ ] Stale KIDs are flagged in the registry
- [ ] Supersession chains are acyclic
- [ ] Superseding KIDs have equal or higher authority tier
- [ ] Version fields follow semver format
