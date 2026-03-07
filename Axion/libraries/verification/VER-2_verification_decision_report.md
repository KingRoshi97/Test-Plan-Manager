---
library: verification
id: VER-2_verification_decision_report
schema_version: 1.0.0
status: draft
---

# VER-2 — Verification Decision Report

## Purpose

A verification decision report is the **canonical output** of a verification pass. It records what was verified, what proof results were collected, where coverage gaps exist, and the final verdict.

## Report Structure

| Field | Type | Required | Description |
|---|---|---|---|
| `report_id` | string | yes | Unique identifier for this decision report |
| `run_id` | string | yes | The run this report belongs to |
| `scope` | object | yes | What was in scope for verification |
| `proof_results` | array | yes | Ordered list of proof outcomes |
| `coverage_gaps` | array | yes | Claims or requirements lacking proof |
| `verdict` | enum | yes | `pass`, `fail`, `conditional_pass`, `deferred` |
| `verdict_rationale` | string | yes | Human-readable explanation of the verdict |
| `issued_at` | datetime | yes | When the report was produced |
| `issued_by` | string | yes | Actor or system that produced the report |

## Scope Object

| Field | Type | Description |
|---|---|---|
| `work_items` | array | List of work item IDs under verification |
| `gate_id` | string | Gate that triggered verification (if any) |
| `standards_refs` | array | Standards that defined proof requirements |

## Proof Results Entry

| Field | Type | Description |
|---|---|---|
| `proof_id` | string | Reference to the proof unit |
| `claim_id` | string | The claim this proof addresses |
| `status` | enum | `pass`, `fail`, `warn`, `expired` |
| `strength_tier` | enum | Tier of the proof at evaluation time |
| `notes` | string | Optional evaluator notes |

## Coverage Gaps Entry

| Field | Type | Description |
|---|---|---|
| `claim_id` | string | The unsatisfied claim |
| `required_proof_class` | string | What class of proof was expected |
| `required_strength_tier` | string | Minimum tier required |
| `reason` | string | Why the gap exists |

## Verdicts

| Verdict | Meaning |
|---|---|
| `pass` | All claims satisfied at required strength |
| `fail` | One or more critical claims lack adequate proof |
| `conditional_pass` | Gaps exist but are accepted with conditions |
| `deferred` | Verification incomplete; will be revisited |

## Schema Reference

Governed by `axion://schemas/verification/verification_decision_report.v1`
