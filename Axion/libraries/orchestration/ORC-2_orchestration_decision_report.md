---
library: orchestration
id: ORC-2-GOV
title: Orchestration Decision Report
schema_version: 1.0.0
status: draft
---

# ORC-2-GOV — Orchestration Decision Report

## Purpose

The orchestration decision report is the canonical record of a single pipeline execution's planning, resolution, and outcome. It captures the execution plan that was computed, the results of each stage, how dependencies were resolved, and the final verdict for the run.

## Report Structure

### Execution Plan

Recorded before stages begin executing. Captures the orchestrator's computed plan.

| Field | Type | Required | Description |
|---|---|---|---|
| plan_id | string | yes | Unique identifier for this execution plan |
| pipeline_id | string | yes | Pipeline definition reference |
| pipeline_version | string | yes | Version of the pipeline used |
| run_id | string | yes | The run this plan belongs to |
| planned_stages | array | yes | Ordered list of stage_ids to execute |
| skipped_stages | array | yes | Stages excluded with reason |
| activation_evaluations | array | yes | Per-stage activation rule evaluation results |
| created_at | string | yes | ISO 8601 timestamp |

### Stage Results

One entry per stage that was attempted.

| Field | Type | Required | Description |
|---|---|---|---|
| stage_id | string | yes | Stage identifier |
| status | string | yes | `success`, `failed`, `skipped`, `cancelled` |
| started_at | string | yes | ISO 8601 timestamp |
| completed_at | string | no | ISO 8601 timestamp |
| artifacts_produced | array | yes | List of artifact_ids produced |
| errors | array | no | Error entries if status is `failed` |
| duration_ms | integer | no | Execution duration in milliseconds |

### Dependency Resolution

Records how each dependency was resolved at execution time.

| Field | Type | Required | Description |
|---|---|---|---|
| stage_id | string | yes | The stage whose dependencies were resolved |
| resolved_dependencies | array | yes | List of dependency resolution entries |

Each resolution entry contains:

| Field | Type | Required | Description |
|---|---|---|---|
| depends_on_stage | string | yes | Upstream stage_id |
| resolution | string | yes | `satisfied`, `skipped_with_override`, `failed_blocking` |
| artifact_refs | array | no | Artifact references used to satisfy the dependency |

### Verdict

The final outcome of the orchestration run.

| Field | Type | Required | Description |
|---|---|---|---|
| verdict | string | yes | `pass`, `fail`, `partial`, `aborted` |
| reason | string | yes | Human-readable explanation |
| gates_passed | array | yes | List of gate_ids that passed |
| gates_failed | array | yes | List of gate_ids that failed |
| total_stages | integer | yes | Total stages in plan |
| stages_succeeded | integer | yes | Count of successful stages |
| stages_failed | integer | yes | Count of failed stages |
| decided_at | string | yes | ISO 8601 timestamp |

## Usage

1. The orchestrator MUST produce a decision report for every run, including aborted runs.
2. Decision reports are immutable once the verdict is recorded.
3. Rerun executions produce a new decision report that references the original run_id.
4. Decision reports are the primary input for orchestration health metrics (see ORC-5-GOV).
