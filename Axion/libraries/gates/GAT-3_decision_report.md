---
library: gates
id: GAT-3
section: decision_report
schema_version: 1.0.0
status: draft
governance_layer: true
complements: GATE-4
---

# GAT-3 — Decision Report Model

## Overview
GAT-3 defines the governance model for gate decision reports. Every gate evaluation produces
a decision report that explains what was checked, why, what evidence was used, and how the
verdict was reached. Decision reports are the primary audit artifact for gate governance.

## Decision Report Purpose

Decision reports serve three audiences:
1. **Operators**: Understand why a gate passed or failed, what to fix, whether to override.
2. **Auditors**: Verify that gate enforcement was consistent, evidence-backed, and deterministic.
3. **Replay Engine**: Reproduce the evaluation from stored inputs and verify verdict consistency.

## Decision Report Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `report_id` | string | yes | Unique identifier for this report |
| `gate_id` | string | yes | Gate that was evaluated |
| `gate_version` | string | yes | Version of the gate definition used |
| `run_id` | string | yes | Pipeline run this evaluation belongs to |
| `stage_id` | string | yes | Pipeline stage context |
| `timestamp` | string | yes | ISO 8601 evaluation timestamp |
| `verdict` | enum | yes | `pass`, `fail`, `warn`, `skip`, `error` |
| `verdict_justification` | string | yes | Human-readable explanation of the verdict |
| `predicates_evaluated` | Predicate[] | yes | List of predicates with individual results |
| `evidence_refs` | EvidenceRef[] | yes | References to evidence artifacts used |
| `applicability_context` | object | yes | Project context that determined this gate applied |
| `override` | Override | no | Override details if an operator overrode the verdict |
| `trace_ref` | string | no | Reference to the full evaluation trace |
| `duration_ms` | integer | no | Evaluation duration in milliseconds |

## Verdict Types

| Verdict | Meaning |
|---|---|
| `pass` | All predicates passed. Gate is satisfied. |
| `fail` | One or more blocker predicates failed. Pipeline halts (unless overridden). |
| `warn` | One or more warning predicates failed. Pipeline continues with recorded warning. |
| `skip` | Gate was not applicable to this project context. |
| `error` | Gate evaluation encountered an error (missing evidence, schema violation, runtime fault). |

## Verdict Justification Requirements
- Every decision report MUST include a `verdict_justification` field.
- The justification MUST reference the specific predicates that determined the verdict.
- For `fail` verdicts, the justification MUST list each failing predicate and its failure reason.
- For `pass` verdicts, the justification MAY be a summary (e.g., "All 3 predicates passed").
- For `error` verdicts, the justification MUST include the error type and diagnostic information.

## Predicate Result Model

Each predicate in `predicates_evaluated` includes:

| Field | Type | Description |
|---|---|---|
| `predicate_id` | string | Identifier of the predicate |
| `expression` | string | The predicate expression evaluated |
| `result` | boolean | Whether the predicate passed |
| `failure_reason` | string | Reason for failure (if `result` is false) |
| `evidence_used` | string[] | Evidence artifacts this predicate consumed |

## Evidence Reference Model

Each entry in `evidence_refs` includes:

| Field | Type | Description |
|---|---|---|
| `evidence_id` | string | Stable identifier for the evidence artifact |
| `evidence_type` | string | Type classification (e.g., `canonical_spec`, `intake_record`) |
| `path` | string | Path or content-addressed hash of the evidence |
| `snapshot_hash` | string | Content hash at time of evaluation |

## Override Model

If an operator overrides a gate failure:

| Field | Type | Description |
|---|---|---|
| `overridden` | boolean | Whether an override was applied |
| `operator_id` | string | Who performed the override |
| `justification` | string | Why the override was granted |
| `risk_acknowledged` | boolean | Whether the operator acknowledged the risk |
| `timestamp` | string | When the override was applied |

## Explainability Rules
- Decision reports MUST be self-contained: an auditor can understand the verdict without external context.
- All evidence references MUST be resolvable (paths exist, hashes match).
- Predicate expressions MUST be included verbatim (not summarized).
- Override justifications MUST be non-empty strings with meaningful content.

## Operator Review
- `fail` verdicts in `production` and `regulated` risk classes MUST be surfaced to operators.
- `warn` verdicts are surfaced in the operator dashboard but do not require acknowledgment.
- `error` verdicts always require operator investigation.
- Operators can request a re-evaluation after fixing the underlying issue.

## Determinism Rules
- Given the same gate version, evidence artifacts, and project context, the decision report
  MUST produce the same verdict and the same predicate results.
- The `verdict_justification` text MAY vary in phrasing but MUST convey the same logical conclusion.
- Evidence `snapshot_hash` values ensure evidence integrity across replay.
