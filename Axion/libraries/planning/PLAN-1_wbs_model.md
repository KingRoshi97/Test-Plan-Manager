---
library: planning
id: PLAN-1
schema_version: 1.0.0
status: draft
---

# PLAN-1 — Work Breakdown Structure (WBS) Model

## Purpose
Define a deterministic task list structure that can be generated from the canonical spec and
used by template fill/executors.

## WBS structure
A WBS is a list of work items, each with:
- a stable work_item_id
- title
- type (design/implementation/test/docs/etc.)
- inputs (refs to canonical entities/artifacts)
- outputs (what artifacts/proofs are produced)
- dependencies (work_item_id refs)
- status (planned/in_progress/done)
- verification hooks (what proof is required)

## Design constraints
- IDs are stable and deterministic (based on canonical keys).
- Dependency graph is acyclic.
- Work items are ordered deterministically for display and execution.
