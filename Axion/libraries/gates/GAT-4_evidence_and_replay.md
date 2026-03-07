---
library: gates
id: GAT-4
section: evidence_and_replay
schema_version: 1.0.0
status: draft
governance_layer: true
complements: GATE-3, GATE-5
---

# GAT-4 — Evidence & Replay

## Overview
GAT-4 defines the governance rules for evidence requirements per gate and the replay contract
that enables deterministic re-evaluation. Evidence is the foundation of gate trust — without
verifiable evidence, gate verdicts are unauditable.

## Evidence Requirements

### Per-Gate Evidence Policy
Every governed gate declares an evidence policy specifying:

| Field | Type | Required | Description |
|---|---|---|---|
| `required_inputs` | string[] | yes | Evidence artifacts the gate needs to evaluate |
| `produced_outputs` | string[] | yes | Evidence artifacts the gate produces |
| `proof_types` | string[] | yes | Proof categories this gate validates |
| `retention_policy` | enum | yes | `run_scoped`, `session_scoped`, `permanent` |
| `integrity_check` | enum | yes | `hash_verified`, `path_verified`, `none` |

### Evidence Categories

| Category | Examples | Typical Gates |
|---|---|---|
| `intake_artifacts` | Intake form, raw input, normalization log | G1_INTAKE_VALIDITY |
| `canonical_artifacts` | Canonical spec, unknown field report | G2_CANONICAL_COMPLETENESS |
| `standards_artifacts` | Standards pack, resolution report | G3_STANDARDS_RESOLUTION |
| `planning_artifacts` | WBS, acceptance map, scope alignment | G4_PLANNING_COVERAGE |
| `generation_artifacts` | Generated documents, templates rendered | G5_GENERATION_COMPLETENESS |
| `verification_artifacts` | Proof ledger, verification reports | G6_VERIFICATION_PASS |
| `packaging_artifacts` | Kit manifest, export bundle | G7_KIT_INTEGRITY |

### Evidence Availability Rules
- All `required_inputs` MUST be available before gate evaluation begins.
- If a required input is missing, the gate verdict is `error` with diagnostic information.
- Evidence availability is checked before predicate evaluation, not during.
- Missing evidence is a gate infrastructure failure, not a predicate failure.

## Evidence Integrity

### Hash Verification
- Evidence artifacts referenced in decision reports include a `snapshot_hash` (SHA-256).
- At evaluation time, the hash is computed and compared to the stored reference.
- Hash mismatch triggers an `error` verdict with an integrity violation diagnostic.

### Path Verification
- Evidence paths must resolve to existing artifacts in the run workspace.
- Path resolution is relative to the run root directory.
- Broken path references trigger an `error` verdict.

## Replay Contract

### Replay Definition
A replay is a re-execution of a gate evaluation using stored inputs to verify that the
same verdict is produced. Replays are used for:
- Audit verification (proving a verdict was correct)
- Regression detection (verifying gate behavior hasn't changed)
- Debugging (reproducing a failure to investigate root cause)

### Replay Input Set
A complete replay input set consists of:

| Component | Source | Purpose |
|---|---|---|
| Gate definition snapshot | Registry at run time | Ensures same predicates are evaluated |
| Evidence artifact snapshots | Run workspace | Ensures same inputs are consumed |
| Project context snapshot | Run metadata | Ensures same applicability context |
| Environment snapshot | Run environment | Ensures same runtime conditions |

### Replay Guarantee
- Given an identical replay input set, the gate MUST produce an identical verdict.
- Predicate evaluation order MUST be identical.
- Evidence references MUST resolve to identical content (verified by hash).
- If the replay produces a different verdict, a **drift incident** is recorded.

### Replay Storage Requirements
- Replay input sets are stored according to the gate's `retention_policy`.
- `run_scoped`: Retained for the duration of the run, discarded after.
- `session_scoped`: Retained for the operator session, discarded after session close.
- `permanent`: Retained indefinitely for compliance purposes.

## Deterministic Evaluation Rules
1. Gate predicates are pure functions of their evidence inputs.
2. No predicate may read external state (network, clock, random) during evaluation.
3. Predicate evaluation order is fixed by `gate_id` ordering within a stage.
4. Short-circuit rules are deterministic: if the first blocker fails, remaining predicates are still evaluated but the verdict is `fail`.
5. Evidence is read-only during evaluation — no gate may modify its input evidence.

## Validation Checklist
- [ ] Every active gate has a complete evidence policy with all required fields.
- [ ] All `required_inputs` categories reference valid evidence categories.
- [ ] All `produced_outputs` are actually produced by the gate evaluation.
- [ ] Hash verification is enabled for `production` and `regulated` risk classes.
- [ ] Replay input sets are stored according to the declared retention policy.
- [ ] Replay of any stored evaluation produces an identical verdict.
