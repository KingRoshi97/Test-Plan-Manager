---
library: gates
id: GATE-1
section: gate_definition_model
schema_version: 1.0.0
status: draft
---

# GATE-1 — Gate Definition Model

## Overview
A gate definition is the declarative specification of a quality checkpoint in the Axion pipeline.
Each gate declares what must be true (predicates), how severe a failure is (severity), what
evidence must exist (evidence_policy), and whether an operator can override a failure (override_hook).

## Gate Definition Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `gate_id` | string | yes | Unique identifier (e.g., `G1_INTAKE_VALIDITY`) |
| `title` | string | yes | Human-readable gate name |
| `stage_id` | string | yes | Pipeline stage this gate guards |
| `description` | string | no | What this gate checks and why |
| `severity` | enum | yes | `blocker` or `warning` |
| `predicates` | Predicate[] | yes | List of conditions that must all pass |
| `evidence_policy` | EvidencePolicy | yes | What evidence the gate requires |
| `override_hook` | OverrideHook | no | Conditions under which operator can override |

## Severity Levels

- **blocker**: Pipeline halts if any predicate fails. No downstream stages execute.
- **warning**: Pipeline continues but the warning is recorded in the gate report and surfaced to operators.

## Evidence Policy

Each gate declares the evidence it needs to evaluate and the evidence it produces:

```json
{
  "required_inputs": ["canonical_spec", "intake_record"],
  "produced_outputs": ["gate_report"],
  "proof_types": ["intake_validation"]
}
```

## Override Hook

Gates may optionally declare an override hook that allows operators to bypass a failure:

```json
{
  "allowed": true,
  "requires_role": "lead_operator",
  "requires_justification": true,
  "max_risk_class": "prototype"
}
```

When `allowed` is false or the override hook is omitted, the gate cannot be overridden.

## Gate Identity Rules
- `gate_id` must be unique across the entire registry.
- `gate_id` format: `G{n}_{SNAKE_CASE_NAME}` (e.g., `G1_INTAKE_VALIDITY`).
- `stage_id` must reference a valid stage from the orchestration pipeline definition.
- Gates are ordered by their numeric prefix within the pipeline.

## Relationship to Runtime
The gate definition model is the **declarative specification**. The runtime gate evaluator
(GATE-3) reads these definitions and executes them. The definition itself contains no
execution logic — only the declaration of what to check.
