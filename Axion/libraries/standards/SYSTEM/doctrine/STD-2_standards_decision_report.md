---
library: standards
doc_id: STD-2_standards_decision_report
title: Standards Decision Report
version: 1.0.0
status: draft
---

# STD-2 — Standards Decision Report

## Purpose

Defines the structure and semantics of a standards decision report. A decision report is emitted whenever the standards resolution engine evaluates which standards apply to a given context. It captures resolution inputs, conflict detection results, override logic, and the final verdict.

## Resolution Inputs

Every decision report records the inputs fed to the resolver:

| Field | Type | Description |
|---|---|---|
| `report_id` | string | Unique identifier for this report. |
| `run_id` | string | The run context that triggered resolution. |
| `timestamp` | datetime | ISO-8601 timestamp of resolution. |
| `context` | object | The evaluation context: profile, risk_class, stack, domain. |
| `candidate_units` | string[] | All `unit_id` values considered during resolution. |
| `index_version` | string | Version of the standards index used. |

## Conflict Detection

The resolver detects conflicts when two or more candidate units produce contradictory rules for the same target:

| Field | Type | Description |
|---|---|---|
| `conflicts` | array | List of detected conflict objects. |
| `conflict.unit_ids` | string[] | The units involved in the conflict. |
| `conflict.rule_ids` | string[] | The specific rules that conflict. |
| `conflict.type` | enum | `contradiction`, `overlap`, `ambiguity`. |
| `conflict.description` | string | Human-readable explanation. |

### Conflict Types

- **contradiction**: Two rules impose mutually exclusive requirements on the same target.
- **overlap**: Two rules address the same target with different severity levels.
- **ambiguity**: Applicability predicates match equally; no precedence can be determined.

## Override Logic

When conflicts are detected, the resolver applies override logic in precedence order:

1. **Explicit override**: A unit declares `overrides: [unit_id]` to take precedence.
2. **Risk class precedence**: Higher risk class wins (`COMPLIANCE` > `PROD` > `PROTOTYPE`).
3. **Specificity**: More specific applicability predicates win over broader ones.
4. **Version recency**: Higher version wins when all else is equal.
5. **Manual resolution**: If no automatic resolution is possible, the conflict is flagged for manual review.

Each override application is logged:

| Field | Type | Description |
|---|---|---|
| `overrides_applied` | array | List of override actions taken. |
| `override.winning_unit` | string | The unit that won. |
| `override.losing_unit` | string | The unit that was overridden. |
| `override.reason` | enum | `explicit`, `risk_precedence`, `specificity`, `version_recency`, `manual`. |

## Verdict

The final output of the decision report:

| Field | Type | Description |
|---|---|---|
| `verdict` | enum | `resolved`, `resolved_with_overrides`, `unresolved`. |
| `resolved_units` | string[] | Final set of `unit_id` values that apply. |
| `resolved_rules` | array | Flattened list of rules from resolved units. |
| `unresolved_conflicts` | array | Conflicts that could not be automatically resolved. |
| `warnings` | string[] | Non-blocking observations. |

### Verdict Semantics

- **resolved**: All candidates were compatible; no conflicts.
- **resolved_with_overrides**: Conflicts existed but were resolved via override logic.
- **unresolved**: At least one conflict requires manual intervention; the run MUST NOT proceed past the standards gate.

## Validation Rules

1. Every decision report MUST have a unique `report_id`.
2. `candidate_units` MUST reference valid entries in the standards registry.
3. If `verdict` is `unresolved`, `unresolved_conflicts` MUST be non-empty.
4. Override reasons MUST be from the defined enum.
5. Reports are immutable once emitted; corrections produce a new report.

## Schema Reference

Governed by `axion://SYSTEM/contracts/standards_decision_report.v1`.
