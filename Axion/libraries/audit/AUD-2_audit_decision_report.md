---
library: audit
id: AUD-2-GOV
title: Audit Decision Report
schema_version: 1.0.0
status: draft
---

# AUD-2 — Audit Decision Report

## Purpose

An audit decision report captures the full context of what was audited, the mutation details, policy compliance assessment, and the resulting verdict. Every governance-significant action produces a decision report.

## Report Structure

### What Was Audited

| Field | Type | Description |
|---|---|---|
| `report_id` | string | Unique identifier for this decision report. Pattern: `AUD-DR-<ULID>`. |
| `audit_unit_id` | string | The governed audit unit under review. |
| `audited_artifact_type` | enum | One of: `schema`, `registry_entry`, `doctrine_doc`, `gate_report`, `run_manifest`, `policy_decision`. |
| `audited_artifact_ref` | string | Path or URI to the artifact under audit. |
| `audit_timestamp` | ISO 8601 | When the audit decision was rendered. |

### Mutation Details

| Field | Type | Description |
|---|---|---|
| `mutation_class` | enum | One of: `create`, `revise`, `supersede`, `deprecate`, `retire`. |
| `mutation_description` | string | Human-readable description of what changed. |
| `prior_version_ref` | string or null | Reference to the previous version (null for `create`). |
| `new_version_ref` | string | Reference to the new/current version. |
| `blast_radius` | enum | One of: `local`, `cross-library`, `system-wide`. |
| `fields_affected` | array of strings | List of schema fields or sections modified. |

### Policy Compliance

| Field | Type | Description |
|---|---|---|
| `policies_evaluated` | array | List of policy IDs that were checked. |
| `compliance_results` | array | Per-policy result objects with `policy_id`, `result` (pass/fail/warn), and `detail`. |
| `backcompat_result` | enum | One of: `compatible`, `migration_required`, `breaking`. |
| `retention_compliant` | boolean | Whether the mutation respects retention policy constraints. |

### Verdict

| Field | Type | Description |
|---|---|---|
| `verdict` | enum | One of: `approved`, `approved_with_conditions`, `rejected`, `deferred`. |
| `verdict_reason` | string | Explanation of the verdict. |
| `conditions` | array of strings or null | Conditions that must be met (for `approved_with_conditions`). |
| `decided_by` | object | Actor who rendered the verdict (`actor_id`, `role`). |

## Verdict Semantics

- **approved**: Mutation may proceed. No outstanding blockers.
- **approved_with_conditions**: Mutation may proceed only after listed conditions are satisfied.
- **rejected**: Mutation is blocked. Must be revised and resubmitted.
- **deferred**: Decision is postponed pending additional information or review.

## Lifecycle

1. A mutation is proposed against an audit unit.
2. The audit decision report is generated with mutation details and policy evaluation.
3. The verdict is rendered and recorded.
4. The report is appended to the audit ledger as an immutable record.

## Schema Reference

Decision reports conform to `axion://schemas/audit/audit_decision_report.v1`.
