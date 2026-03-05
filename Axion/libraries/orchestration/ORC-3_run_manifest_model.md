---
library: orchestration
id: ORC-3
schema_version: 1.0.0
status: draft
---

# ORC-3 — Run Manifest Model

## Purpose
The run manifest is the single, authoritative record of a pipeline run:
- which pipeline version ran
- which pins/locks were resolved
- which stages executed (and their outcomes)
- what artifacts were produced and where they live
- which gates passed/failed and why
- how/when the run was resumed or rerun

## Key properties
- Append-only event log semantics (no silent edits)
- Deterministic pointers to artifacts (path + hash optional)
- Stable stage timeline entries (start/end/status)
- Captures policy/quota/adapters decisions from `system/`

## Consumers
- Orchestrator (resume/rerun)
- Operator UI (timeline)
- Gate evaluator (evidence pointers)
- Kit packager (collect outputs)
