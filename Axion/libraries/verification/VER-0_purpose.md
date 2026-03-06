---
library: verification
id: VER-0
schema_version: 1.0.0
status: draft
---

# VER-0 — verification/ Purpose + Boundaries

## Purpose
`verification/` defines Axion's **proof and completion system**:
- what "proof" is (types, required fields)
- how command runs are recorded (what was executed, outputs, status)
- how proofs are collected into a proof ledger
- what completion criteria mean (unit done + run done)

Verification is what makes gates like G7_VERIFICATION enforceable and audit-ready.

## What it governs (in scope)
- Proof types registry (what proofs exist and how to interpret them)
- Proof ledger schema (the canonical record of proofs for a run)
- Command run tracking schema (what commands were executed, results, logs refs)
- Verification command policy hooks (what commands are allowed in which environments)
- Completion criteria (when a task is "done" and when a run is "done")

## What it does NOT govern (out of scope)
- Gate DSL semantics → `gates/`
- Stage ordering and run manifest → `orchestration/`
- Policy meaning → `policy/`
- Adapter capability system plumbing → `system/`
- Ops standards (SLOs/alerts/etc.) → `ops/`

## Consumers
- Gate evaluation stage (S8) for proof checks
- Orchestrator (pause/fail on missing proofs)
- Operator UI (proof viewer, command logs)
- Kit packager (include proof ledger in kit if required)

## Determinism requirements
- Proof requirements are derived from pinned standards + plan acceptance evidence.
- Proof ledger is append-only for a run.
- Proof records reference artifacts/logs by path + optional hash.
