---
library: gates
id: GATE-5
section: replay_evidence_requirements
schema_version: 1.0.0
status: draft
---

# GATE-5 — Replay Evidence Requirements

## Overview
For a replay to be valid, the evidence from the original run must be preserved and
accessible. This document defines what evidence must be retained and how it is
referenced during replay.

## Required Evidence for Replay

### 1. Run Manifest
- The original run manifest must be preserved intact.
- The manifest records gate registry version, DSL function registry version, and
  artifact paths used during the original evaluation.

### 2. Gate Reports
- All original gate reports must be preserved.
- Reports are used to compare original vs. replay verdicts.

### 3. Artifact Snapshots
Depending on snapshot mode:

**content_hash mode:**
- Artifacts remain at their original paths.
- Content hashes recorded in the original run are used for integrity verification.
- If an artifact has been modified since the original run, the replay detects drift.

**file_copy mode:**
- Artifacts are copied to `{replay_run_dir}/snapshot/` before evaluation.
- The copy is a point-in-time snapshot of the original artifacts.

### 4. Gate Registry Snapshot
- The gate registry version used in the original run must be available.
- If the registry has been updated since the original run, the pinned version is used.

### 5. DSL Function Registry Snapshot
- The DSL function registry version used in the original run must be available.
- Function semantics must not have changed for the pinned version.

## Evidence Retention Policy
- Gate reports are retained for the lifetime of the run record.
- Artifact snapshots are retained according to the project's retention policy.
- Registry versions are retained indefinitely (registries are append-only).

## Replay Evidence Output
A replay produces:
1. New gate reports in the replay run directory.
2. A replay comparison record listing original vs. replay verdicts.
3. A determinism verification result (pass/fail).

## Failure Modes

| Failure | Code | Description |
|---|---|---|
| Artifact missing | `E_SNAPSHOT_MISSING` | Required artifact not found at original path |
| Artifact modified | `E_SNAPSHOT_DRIFT` | Artifact content hash differs from original |
| Registry version missing | `E_REGISTRY_VERSION_MISSING` | Pinned registry version not available |
| Verdict mismatch | `E_DETERMINISM_VIOLATION` | Replay verdict differs from original |
