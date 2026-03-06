---
library: verification
id: VER-2
schema_version: 1.0.0
status: draft
---

# VER-2 — Proof Ledger Model

## Purpose
Define the canonical proof ledger — the append-only record of all proofs collected during a run.

## What the proof ledger is
The proof ledger is a structured, append-only log that records every proof generated during a pipeline run. Each entry references a work item, proof type, status, and evidence artifacts.

## Key properties
- Append-only: proofs are added but never removed or modified within a run
- Run-scoped: each run has exactly one proof ledger
- Evidence is referenced by path + optional hash, not embedded
- Proofs are validated against the proof_types registry (VER-1)

## Ledger fields
- ledger_id: unique identifier for this ledger instance
- run_id: the pipeline run this ledger belongs to
- proofs[]: array of proof entries, each containing:
  - proof_id: unique proof identifier
  - proof_type: must match a type in proof_types registry
  - work_item_id: the work item this proof applies to
  - status: pass / fail / warn
  - evidence_refs[]: paths to logs/artifacts (with optional hash)
  - recorded_at: ISO 8601 timestamp
  - metadata: optional key-value pairs for additional context

## Consumers
- Gate evaluation (G7_VERIFICATION) reads the ledger to check proof coverage
- Completion criteria evaluation checks the ledger for unit_done requirements
- Kit packager includes the ledger as a run artifact
- Operator UI displays proof status and evidence links
