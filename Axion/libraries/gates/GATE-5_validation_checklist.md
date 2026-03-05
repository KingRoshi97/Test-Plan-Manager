---
library: gates
id: GATE-5
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# GATE-5 — Validation Checklist (Determinism & Replay)

## Replay Request Validation
- [ ] `original_run_id` is a non-empty string
- [ ] `replay_run_id` is a non-empty string and differs from `original_run_id`
- [ ] `manifest_ref` points to a valid, readable run manifest
- [ ] `gate_ids` (if provided) all reference valid gates in the registry
- [ ] `snapshot_mode` is one of: `content_hash`, `file_copy`

## Pre-Replay Validation
- [ ] Original run manifest exists and is valid JSON
- [ ] Original gate reports exist for all gates being replayed
- [ ] Gate registry version from original run is available
- [ ] DSL function registry version from original run is available
- [ ] All referenced artifacts exist (or snapshot is available)

## Snapshot Validation (content_hash mode)
- [ ] All artifact content hashes match the original run's recorded hashes
- [ ] No artifacts have been modified since the original run
- [ ] Missing artifacts produce `E_SNAPSHOT_MISSING`
- [ ] Modified artifacts produce `E_SNAPSHOT_DRIFT`

## Snapshot Validation (file_copy mode)
- [ ] All artifacts successfully copied to replay directory
- [ ] Copies are byte-identical to originals at copy time
- [ ] Replay evaluation uses copies, not originals

## Post-Replay Validation
- [ ] Replay gate reports conform to `gate_report.v1.schema.json`
- [ ] Replay verdicts compared against original verdicts
- [ ] Matching verdicts produce determinism verification pass
- [ ] Mismatching verdicts produce `E_DETERMINISM_VIOLATION` with details
- [ ] Replay comparison record is written to replay run directory

## Determinism Verification
- [ ] All replayed gates produce the same `status` as the original
- [ ] All replayed gates produce the same `failure_codes` as the original
- [ ] Evidence entries match (paths, pointers — details may differ in timestamps)
