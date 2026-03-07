---
library: policy
doc_id: POL-1-GOV
title: Policy Unit Model
version: 1.0.0
status: draft
---

# POL-1-GOV — Policy Unit Model

## Purpose

A **policy unit** is the atomic governance primitive in Axion. Every enforceable
rule, constraint, threshold, or override permission is expressed as a policy unit
with a stable identity, version, owner, and lifecycle state.

## Structure

Each policy unit contains:

| Field           | Type     | Description                                              |
|-----------------|----------|----------------------------------------------------------|
| `unit_id`       | string   | Stable identifier (e.g. `PU-AUTH-001`)                   |
| `name`          | string   | Human-readable name                                      |
| `version`       | semver   | Current version of the unit                              |
| `status`        | enum     | `draft` · `active` · `deprecated` · `superseded`         |
| `owner`         | string   | Responsible team or role                                  |
| `risk_class`    | enum     | `PROTOTYPE` · `PROD` · `COMPLIANCE`                      |
| `applicability` | object   | Scoping rules (stages, gates, libraries, run profiles)   |
| `dependencies`  | string[] | IDs of other policy units this unit depends on            |

## Lifecycle

1. **draft** — under development; not enforced.
2. **active** — enforced in matching scopes.
3. **deprecated** — still enforced but scheduled for removal; warnings emitted.
4. **superseded** — replaced by a newer unit; no longer enforced.

## Applicability

Applicability determines where the unit is evaluated:

- `stages` — list of orchestration stages (e.g. `["intake", "build"]`)
- `gates` — list of gate IDs (e.g. `["G1_INTAKE_VALIDITY"]`)
- `libraries` — library scopes (e.g. `["knowledge", "standards"]`)
- `run_profiles` — run profile selectors (e.g. `["full", "incremental"]`)

An empty list means "all" for that dimension.

## Determinism

Policy units are versioned and pinned per run. The policy engine resolves the
effective set at run start and locks it for the duration.

## Schema

Validated by `policy_unit.v1.schema.json`.
