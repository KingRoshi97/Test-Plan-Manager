---
library: gates
id: GATE-4
section: gate_report_model
schema_version: 1.0.0
status: draft
---

# GATE-4 — Gate Report Model

## Overview
A gate report is the immutable record of a gate evaluation. It captures the verdict,
individual predicate results, evidence, and any override actions.

## Report Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `run_id` | string | yes | Run identifier |
| `gate_id` | string | yes | Gate identifier |
| `stage_id` | string | yes | Stage this gate guards |
| `target` | string | yes | What the gate is checking (e.g., "intake", "canonical") |
| `status` | enum | yes | `pass`, `fail`, or `warn` |
| `evaluated_at` | string | yes | ISO 8601 timestamp of evaluation |
| `engine` | object | yes | Evaluator engine metadata (`name`, `version`) |
| `issues` | Issue[] | no | List of issues found during evaluation |
| `checks` | CheckReport[] | yes | Per-check results |
| `failure_codes` | string[] | yes | List of failure codes (empty if pass) |
| `evidence` | Evidence[] | yes | Evidence entries from failed checks |
| `evidence_completeness` | object | no | Evidence completeness assessment |
| `override` | Override | no | Override details if gate was overridden |
| `trace_ref` | string | no | Path to evaluation trace (if trace_mode was enabled) |

## Check Report Structure

Each check within a gate produces a check report:

```json
{
  "check_id": "file_exists",
  "status": "pass",
  "failure_code": null,
  "evidence": [
    {
      "path": ".axion/runs/run_abc/artifacts/canonical_spec.json",
      "pointer": "",
      "details": {}
    }
  ]
}
```

## Issue Structure

Issues provide human-readable descriptions of problems found:

```json
{
  "code": "E_FILE_MISSING",
  "severity": "error",
  "message": "Required artifact not found: canonical_spec.json",
  "pointer": "/artifacts/canonical_spec.json"
}
```

## Override Structure

When a gate failure is overridden by an operator:

```json
{
  "overridden_by": "operator@example.com",
  "role": "lead_operator",
  "justification": "Prototype run — coverage threshold relaxed per policy P-003",
  "overridden_at": "2025-01-15T10:30:00Z",
  "original_status": "fail"
}
```

## Report Lifecycle
1. Report is created during gate evaluation.
2. Report is written to `{run_dir}/gates/{gate_id}.gate_report.json`.
3. Report path is recorded in the run manifest's `gate_reports` array.
4. Report is immutable after creation (no edits).
5. If overridden, the override section is appended (the original status is preserved).

## Status Derivation
- `pass`: All predicates passed.
- `fail`: At least one predicate failed in a blocker gate.
- `warn`: At least one predicate failed in a warning gate, or evidence completeness issues exist.
