---
library: orchestration
id: ORC-5-GOV
title: Orchestration Health
schema_version: 1.0.0
status: draft
---

# ORC-5-GOV — Orchestration Health

## Purpose

Defines the metrics, thresholds, and validation checklist for assessing the health of the orchestration system. Orchestration health is evaluated across five dimensions: stage coverage, dependency freshness, rerun success rate, orphaned stage detection, and structural validation.

## Stage Coverage

Stage coverage measures whether all declared stages are actively exercised in production runs.

| Metric | Definition | Healthy Threshold |
|---|---|---|
| stage_execution_rate | % of stages executed at least once in the last 30 days | ≥ 95% |
| stage_skip_rate | % of runs where a stage was skipped | ≤ 10% per stage |
| stage_failure_rate | % of executions where a stage failed | ≤ 5% per stage |
| uncovered_stages | Stages with zero executions in measurement window | 0 |

### Actions

- Stages with >10% skip rate SHOULD be reviewed for activation rule accuracy.
- Stages with >5% failure rate MUST trigger an investigation.
- Uncovered stages MUST be either executed in a validation run or marked deprecated.

## Dependency Freshness

Dependency freshness tracks whether stage-to-library bindings reference current schema versions.

| Metric | Definition | Healthy Threshold |
|---|---|---|
| stale_dependencies | Stage dependencies referencing schema versions >1 major behind | 0 |
| version_drift_count | Number of dependencies where library version exceeds declared constraint | 0 |
| last_dependency_audit | Time since last full dependency audit | ≤ 30 days |

### Actions

- Stale dependencies MUST be updated or the stage MUST document an exemption.
- Version drift MUST trigger revalidation of affected stages.
- Dependency audits MUST be performed at least monthly.

## Rerun Success Rate

Tracks the reliability of rerun operations.

| Metric | Definition | Healthy Threshold |
|---|---|---|
| rerun_success_rate | % of rerun attempts that completed successfully | ≥ 90% |
| rerun_cascade_depth | Average number of downstream stages invalidated per rerun | ≤ 3 |
| rerun_duration_ratio | Average rerun duration / average full run duration | ≤ 0.5 |

### Actions

- Rerun success rate <90% MUST trigger investigation into invalidation logic.
- Cascade depth >3 SHOULD prompt review of dependency granularity.
- Duration ratio >0.5 indicates insufficient caching or over-broad invalidation.

## Orphaned Stages

Orphaned stages are stage_ids that appear in one context but not another.

| Check | Definition | Expected |
|---|---|---|
| registry_without_pipeline | Stage in orchestration registry but not in pipeline definition | 0 |
| pipeline_without_registry | Stage in pipeline definition but not in orchestration registry | 0 |
| unreferenced_artifacts | Artifacts produced but never consumed by any stage or gate | 0 |
| dangling_gate_evidence | Gate evidence references pointing to non-existent artifacts | 0 |

### Actions

- All orphaned entries MUST be resolved before a pipeline version is promoted to production.
- Unreferenced artifacts SHOULD be reviewed; they may indicate incomplete integration.

## Validation Checklist

Run this checklist before any pipeline version promotion.

| # | Check | Pass Criteria |
|---|---|---|
| 1 | All stages have governed unit entries | Every stage_id in pipeline has a registry entry |
| 2 | Dependency graph is a valid DAG | No circular dependencies detected |
| 3 | All schema_refs resolve | Every schema reference in stage units exists in schema registry |
| 4 | All gate evidence origins are valid | Every gate_id and evidence_artifact pair is resolvable |
| 5 | No orphaned stages | registry_without_pipeline = 0, pipeline_without_registry = 0 |
| 6 | No stale dependencies | stale_dependencies = 0, version_drift_count = 0 |
| 7 | Backward compatibility verified | Pipeline version bump follows ORC-4-GOV rules |
| 8 | Rerun eligibility confirmed | All stages with can_rerun=true pass rerun simulation |
| 9 | Artifact production completeness | Every artifact in the graph has a producing stage |
| 10 | Decision report schema valid | orchestration_decision_report schema validates against draft-07 |

## Reporting

Orchestration health reports SHOULD be generated:
- After every pipeline version change.
- Weekly for production pipelines.
- On demand when investigating run failures.

Health reports are stored as decision report appendices and referenced from the run manifest.
