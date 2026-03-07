---
library: system
id: SYS-3-GOV
schema_version: 1.0.0
status: draft
---

# SYS-3 — Cross-Library Dependency Graph

## Purpose

This doctrine formalizes the resolution order and dependency relationships between Axion
libraries. It defines dependency edges, enforces acyclic constraints, and specifies how
circular dependency detection is performed.

## Formalized Resolution Order

Axion libraries are resolved in a fixed topological order. The canonical resolution tiers are:

| Tier | Libraries | Description |
|---|---|---|
| 0 | `system` | Control plane foundation; no upstream dependencies |
| 1 | `policy`, `audit` | Governance primitives; depend only on `system` |
| 2 | `intake`, `canonical` | Input normalization; depend on `system`, `policy` |
| 3 | `standards`, `knowledge` | Reference content; depend on `system`, `canonical` |
| 4 | `gates`, `templates` | Evaluation and rendering; depend on tiers 0–3 |
| 5 | `orchestration` | Pipeline execution; depends on all above |
| 6 | `verification`, `kit` | Output production; depend on `orchestration` |
| 7 | `telemetry`, `ops` | Observability; may depend on any library |

## Dependency Edges

A dependency edge is a directed relationship `A → B` meaning library A depends on library B.

Rules for dependency edges:

1. Edges must flow from higher tiers to lower tiers (or within the same tier if acyclic).
2. Each edge must declare the contract version it depends on.
3. Edges are recorded in the library's manifest under `dependencies[]`.
4. Cross-tier upward dependencies (lower tier depending on higher) are prohibited.

## Circular Dependency Detection

The resolver performs circular dependency detection at two stages:

### Static Analysis (build time)

- Parse all library manifests and extract `dependencies[]`.
- Construct a directed graph of library-to-library edges.
- Run topological sort; if the sort fails, report the cycle.
- Cycles are a hard error; the system will not proceed.

### Runtime Detection

- During resolution, maintain a visited-set per resolution chain.
- If a library is encountered twice in the same chain, emit a `circular_dependency` error.
- The error includes the full cycle path for diagnosis.

## Dependency Staleness

A dependency edge is considered stale when:

- The depended-upon library has a newer major version than the edge declares.
- The depended-upon contract has been deprecated.
- The edge has not been validated in the configured staleness window (default: 90 days).

Stale dependencies generate warnings in the system decision report.

## Graph Integrity Constraints

- Every library must appear exactly once in the resolution order.
- No library may depend on itself.
- The `system` library (tier 0) must have zero upstream dependencies.
- All dependency edges must reference libraries that exist in the library index.
