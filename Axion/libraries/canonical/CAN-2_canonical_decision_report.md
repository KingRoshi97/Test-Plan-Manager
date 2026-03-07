---
library: canonical
id: CAN-2-GOV
title: Canonical Decision Report
schema_version: 1.0.0
status: draft
---

# CAN-2 — Canonical Decision Report

## Purpose

The Canonical Decision Report captures every resolution decision made during canonical spec construction. It records entity resolution outcomes, provenance assignments, downstream invalidation effects, and the final verdict for each decision.

## Report Structure

Each decision report contains the following sections:

### Decision Entry

| Field | Type | Required | Description |
|---|---|---|---|
| `decision_id` | string | yes | Unique decision identifier (pattern: `CDR-[A-Z0-9]{6,}`) |
| `entity_id` | string | yes | The canonical entity this decision applies to |
| `decision_type` | enum | yes | One of: `entity_resolution`, `provenance_assignment`, `merge`, `split`, `deprecation` |
| `timestamp` | datetime | yes | When the decision was made |
| `resolution_version` | string | yes | Version of the resolution rules applied |

### Entity Resolution

| Field | Type | Required | Description |
|---|---|---|---|
| `input_sources` | array | yes | List of intake/standard references that contributed |
| `conflict_detected` | boolean | yes | Whether conflicting inputs were found |
| `conflict_resolution_method` | string | conditional | Method used if conflict detected (e.g., `priority_override`, `merge`, `operator_decision`) |
| `resolved_entity_snapshot` | object | yes | The entity state after resolution |

### Provenance Assignment

| Field | Type | Required | Description |
|---|---|---|---|
| `previous_class` | enum | no | Prior provenance class if this is a re-assignment |
| `assigned_class` | enum | yes | One of: `hard_fact`, `inferred_fact`, `unresolved_unknown` |
| `evidence` | array | yes | List of evidence references supporting the assignment |
| `inference_chain` | array | conditional | Required if `assigned_class` is `inferred_fact` |

### Downstream Invalidation

| Field | Type | Required | Description |
|---|---|---|---|
| `invalidated_artifacts` | array | yes | List of downstream artifacts affected by this decision |
| `invalidation_reason` | string | yes | Why downstream artifacts are stale |
| `requires_recompute` | array | yes | Stages that must re-run |

### Verdict

| Field | Type | Required | Description |
|---|---|---|---|
| `verdict` | enum | yes | One of: `accepted`, `deferred`, `rejected`, `escalated` |
| `rationale` | string | yes | Human-readable explanation of the verdict |
| `follow_up_required` | boolean | yes | Whether further action is needed |
| `follow_up_action` | string | conditional | Description of required follow-up if applicable |

## Governance Rules

1. Every entity resolution MUST produce a decision report entry.
2. Decision reports are append-only; existing entries MUST NOT be modified.
3. All provenance assignments MUST include at least one evidence reference.
4. Downstream invalidation MUST be computed and recorded for every decision that changes entity state.
5. Verdicts of `deferred` or `escalated` MUST include a `follow_up_action`.

## Schema Reference

- Validation schema: `axion://schemas/canonical/canonical_decision_report.v1`
