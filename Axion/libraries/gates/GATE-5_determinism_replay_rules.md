---
library: gates
id: GATE-5
section: determinism_replay_rules
schema_version: 1.0.0
status: draft
---

# GATE-5 — Determinism & Replay Rules

## Overview
Gate replay is the ability to re-evaluate gates against a snapshot of a previous run's
inputs and verify that the same verdicts are produced. This is the foundation of
Axion's determinism guarantee.

## Replay Contract

A replay evaluation must produce the **same verdict** as the original evaluation when given:
1. The same gate definition (same registry version)
2. The same artifact snapshot (same file contents)
3. The same run manifest snapshot
4. The same DSL function registry version

## Replay Request

A replay is initiated with a replay request:

```json
{
  "original_run_id": "run_abc123",
  "replay_run_id": "run_replay_001",
  "manifest_ref": ".axion/runs/run_abc123/run_manifest.json",
  "gate_ids": ["G1_INTAKE_VALIDITY", "G2_CANONICAL_INTEGRITY"],
  "snapshot_mode": "content_hash"
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `original_run_id` | string | yes | Run being replayed |
| `replay_run_id` | string | yes | New run ID for the replay |
| `manifest_ref` | string | yes | Path to the original run manifest |
| `gate_ids` | string[] | no | Specific gates to replay (empty = all) |
| `snapshot_mode` | enum | yes | `content_hash` or `file_copy` |

## Snapshot Modes

### content_hash
- Artifacts are read from their original paths.
- Content hashes are computed and compared to the original run's recorded hashes.
- If hashes match, evaluation proceeds.
- If hashes differ, the replay is aborted with `E_SNAPSHOT_DRIFT`.

### file_copy
- Artifacts are copied to a replay directory before evaluation.
- Evaluation runs against the copies.
- This mode is slower but guarantees isolation from concurrent changes.

## Replay Verification
After replay, the system compares:
1. Original gate verdicts vs. replay verdicts.
2. If all verdicts match → replay passes (determinism verified).
3. If any verdict differs → replay fails with `E_DETERMINISM_VIOLATION`, listing the divergent gates.

## Constraints
- Replay does not execute stage logic — only gate evaluation.
- Replay does not apply overrides — it evaluates raw predicate results.
- Replay uses the pinned DSL function registry version, not the current version.
- Replay is read-only with respect to the original run's artifacts.
