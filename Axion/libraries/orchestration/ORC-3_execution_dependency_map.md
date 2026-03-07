---
library: orchestration
id: ORC-3-GOV
title: Execution Dependency Map
schema_version: 1.0.0
status: draft
---

# ORC-3-GOV — Execution Dependency Map

## Purpose

Defines the rules for declaring stage-to-library dependencies, mapping artifact production graphs, and determining rerun invalidation cascades. This doctrine ensures that dependency relationships are explicit, auditable, and mechanically enforceable.

## Stage-to-Library Dependency Declarations

Each stage declares which libraries it depends on. These declarations are structural (not runtime); they define the contract surface the stage binds to.

### Declaration Format

| Field | Type | Required | Description |
|---|---|---|---|
| stage_id | string | yes | The stage declaring the dependency |
| library | string | yes | Target library name |
| contract_ref | string | yes | Schema or contract ID within the library |
| binding | string | yes | `read` (consumes), `write` (produces into), `validate` (checks against) |
| version_constraint | string | yes | SemVer range the stage is compatible with |

### Rules

1. A stage MUST NOT access a library artifact without a corresponding dependency declaration.
2. Library version changes outside the declared `version_constraint` MUST trigger a revalidation of the stage.
3. Dependency declarations are versioned with the pipeline definition.

## Artifact Production Graph

The artifact production graph is a directed acyclic graph (DAG) where:
- **Nodes** are artifacts (identified by artifact_id).
- **Edges** represent production and consumption relationships between stages.

### Graph Construction Rules

1. For each stage, draw edges from consumed artifacts to the stage node.
2. For each stage, draw edges from the stage node to produced artifacts.
3. The resulting graph MUST be acyclic.
4. Every artifact node MUST have exactly one producing stage.
5. An artifact node MAY have zero or more consuming stages.

### Graph Uses

- **Execution ordering**: Topological sort of the graph determines valid execution orders.
- **Impact analysis**: Given a changed artifact, all downstream consumers are identifiable.
- **Completeness check**: Every artifact referenced in gate evidence MUST appear in the graph.

## Rerun Invalidation Rules

When a stage is rerun, downstream artifacts and stages may be invalidated.

### Invalidation Cascade

1. When stage `S_n` is rerun, all artifacts produced by `S_n` are invalidated.
2. Any stage that consumes an invalidated artifact MUST be marked for rerun.
3. Invalidation propagates transitively through the artifact production graph.
4. Stages with no dependency on invalidated artifacts are NOT affected.

### Invalidation Boundaries

| Scenario | Invalidation Scope |
|---|---|
| Single stage rerun | That stage + all transitive downstream consumers |
| Input data change | S1 (ingest) + full cascade |
| Library schema update | All stages declaring dependency on that library |
| Gate override revocation | Stage after the gate + downstream |

### Rerun Eligibility

A stage is eligible for rerun only if:
1. Its `can_rerun` flag is `true` in the pipeline definition.
2. All upstream dependencies can be satisfied (either from cache or by rerunning).
3. No active gate hold blocks re-entry to the stage.

### Invalidation Record

Every invalidation event MUST be recorded with:
- `invalidation_id`: Unique identifier
- `trigger`: What caused the invalidation (rerun, schema change, override revocation)
- `affected_stages`: List of stage_ids invalidated
- `affected_artifacts`: List of artifact_ids invalidated
- `timestamp`: ISO 8601
