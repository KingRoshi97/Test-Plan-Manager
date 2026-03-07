---
library: orchestration
id: ORC-4-GOV
title: Backward Compatibility and Rerun Policy
schema_version: 1.0.0
status: draft
---

# ORC-4-GOV — Backward Compatibility and Rerun Policy

## Purpose

Defines the rules for maintaining backward compatibility when pipeline definitions change, the invalidation semantics for rerun and resume operations, and the migration paths for evolving orchestration structures without breaking in-flight runs.

## Backward Compatibility for Pipeline Changes

### Versioning Rules

1. Pipeline definitions MUST use semantic versioning (`major.minor.patch`).
2. **Patch**: Bug fixes to stage metadata, no structural changes. Backward compatible.
3. **Minor**: New optional stages added, new optional fields on existing stages. Backward compatible.
4. **Major**: Stage removal, stage renaming, dependency graph restructuring, required field changes. NOT backward compatible.

### Compatibility Matrix

| Change Type | Compat | In-Flight Runs | New Runs |
|---|---|---|---|
| Add optional stage | yes | Unaffected, new stage skipped | Include new stage |
| Add required field to stage | no | Fail validation on resume | Must use new version |
| Remove stage | no | Orphaned stage references | Stage absent |
| Rename stage_id | no | Broken references | Must use new ID |
| Change stage order | yes* | Resume uses original order | Uses new order |
| Change consumes/produces | no | Mismatched artifacts | Must use new version |

*Order changes are compatible only if the dependency DAG remains valid.

### In-Flight Run Protection

1. An in-flight run is pinned to the pipeline version it started with.
2. Pipeline version upgrades MUST NOT alter the definition used by in-flight runs.
3. The orchestrator MUST store the full pipeline definition snapshot in the run manifest.

## Rerun and Resume Invalidation

### Resume Semantics

Resume continues a paused or failed run from the last successful stage.

1. The orchestrator MUST verify that the pipeline definition has not changed incompatibly since the run was paused.
2. If an incompatible change occurred, resume MUST be rejected with a `PIPELINE_VERSION_MISMATCH` error.
3. Artifacts produced by previously successful stages are reused without re-execution.
4. Gates that were previously passed are NOT re-evaluated on resume unless their evidence artifacts were invalidated.

### Rerun Semantics

Rerun re-executes one or more stages within an existing run.

1. Rerun invalidates all artifacts produced by the target stage (see ORC-3-GOV invalidation cascade).
2. Downstream stages that consumed invalidated artifacts MUST be re-executed.
3. Upstream stages are NOT affected by a downstream rerun.
4. A rerun MUST produce a new decision report (ORC-2-GOV) linked to the original run_id.

### Invalidation on Schema Changes

1. If a library schema referenced by a stage dependency declaration changes beyond its version constraint, all runs consuming that schema version MUST be flagged.
2. Completed runs are NOT retroactively invalidated; only in-flight and future runs are affected.
3. The orchestrator SHOULD emit a `SCHEMA_DRIFT_WARNING` for completed runs that used the old schema version.

## Migration Paths

### Stage Rename Migration

1. Create the new stage_id with identical configuration.
2. Add an alias mapping: `old_stage_id → new_stage_id` in the pipeline definition.
3. In-flight runs continue using the old stage_id via the alias.
4. After all in-flight runs complete, remove the alias and old stage_id.

### Stage Removal Migration

1. Mark the stage as `deprecated` in the pipeline definition (minor version bump).
2. Set activation mode to `manual` so new runs skip it by default.
3. After a defined grace period with no active runs using the stage, remove it (major version bump).

### Dependency Graph Restructuring

1. Publish the new pipeline version with updated dependency declarations.
2. In-flight runs are unaffected (pinned to old version).
3. New runs use the updated graph.
4. Validate that no circular dependencies are introduced.

## Audit Requirements

1. Every pipeline version change MUST be recorded in the audit ledger.
2. Every rerun and resume event MUST include the triggering reason and the invalidation scope.
3. Migration alias mappings MUST be preserved until all referencing runs are archived.
