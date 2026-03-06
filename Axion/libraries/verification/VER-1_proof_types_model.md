---
library: verification
id: VER-1
schema_version: 1.0.0
status: draft
---

# VER-1 — Proof Types Model

## Purpose
Define the allowed proof types and their required fields so proof checking is deterministic.

## What a proof is
A proof is a structured record that a verification action occurred and produced evidence.

## Proof type examples
- command_run (a command executed, with logs/ref)
- test_suite (unit/integration/e2e results)
- lint_check (lint/format verification)
- build_artifact (successful build output)
- security_scan (SAST/DAST/dependency scan)
- manual_attestation (human approval for something)

## Required proof fields (minimum)
- proof_id
- proof_type
- status (pass/fail/warn)
- evidence_refs (paths to logs/artifacts)
- recorded_at
