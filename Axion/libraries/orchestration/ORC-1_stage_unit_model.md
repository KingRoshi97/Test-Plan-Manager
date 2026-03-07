---
library: orchestration
id: ORC-1-GOV
title: Stage Unit Model
schema_version: 1.0.0
status: draft
---

# ORC-1-GOV — Stage Unit Model

## Purpose

Every pipeline stage is a **governed unit**. This doctrine defines the mandatory structural contract each stage must satisfy to participate in orchestration. A governed stage unit declares its identity, what it consumes from other libraries, what artifacts it produces, where its gate evidence originates, and what upstream dependencies it requires.

## Stage Unit Structure

Each governed stage unit MUST declare the following:

### stage_id

A unique identifier matching the pattern `S{n}_{NAME}`. The stage_id is immutable once published; renaming requires a migration (see ORC-4-GOV).

### library_consumption

An explicit list of libraries the stage reads from during execution. Each entry specifies the library name and the contract or schema it binds to. A stage MUST NOT consume a library artifact that is not declared here.

| Field | Type | Required | Description |
|---|---|---|---|
| library | string | yes | Library name (e.g., `intake`, `canonical`, `standards`) |
| contract_ref | string | yes | Schema or contract ID consumed |
| version | string | yes | Minimum version required |

### artifact_production

An explicit list of artifacts the stage produces on successful completion. Each artifact has a type, a schema reference, and a persistence target.

| Field | Type | Required | Description |
|---|---|---|---|
| artifact_id | string | yes | Unique artifact identifier |
| schema_ref | string | yes | Schema the artifact conforms to |
| persistence | string | yes | Where the artifact is stored (`run_store`, `ledger`, `manifest`) |

### gate_evidence_origins

Declares which artifacts produced by this stage serve as evidence inputs for downstream gate evaluations. Each entry links an artifact to the gate that consumes it.

| Field | Type | Required | Description |
|---|---|---|---|
| gate_id | string | yes | The gate that evaluates this evidence |
| evidence_artifact | string | yes | artifact_id from artifact_production |
| evidence_type | string | yes | `report`, `validation`, `proof`, `bundle` |

### dependency_declarations

Explicit upstream stage dependencies. A stage MUST NOT execute until all declared dependencies have completed successfully or been skipped with an approved override.

| Field | Type | Required | Description |
|---|---|---|---|
| depends_on_stage | string | yes | Upstream stage_id |
| dependency_type | string | yes | `data` (needs output), `ordering` (must run after), `gate` (gate must pass) |
| required | boolean | yes | If true, upstream failure blocks this stage |

## Validation Rules

1. Every `stage_id` in the pipeline definition MUST have a corresponding governed unit entry in the orchestration registry.
2. Every artifact listed in `artifact_production` MUST have a valid `schema_ref` resolvable in the schema registry.
3. Every `depends_on_stage` MUST reference a valid `stage_id` in the same pipeline.
4. Circular dependencies are forbidden; the dependency graph MUST be a DAG.
5. Every gate referenced in `gate_evidence_origins` MUST exist in the pipeline's `gate_points`.

## Conformance

A stage that does not satisfy all fields in this model is considered **non-governed** and MUST NOT be included in a production pipeline definition.
