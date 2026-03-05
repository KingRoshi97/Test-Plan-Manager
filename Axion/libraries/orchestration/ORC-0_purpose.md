---
library: orchestration
id: ORC-0
schema_version: 1.0.0
status: draft
---

# ORC-0 — orchestration/ Purpose + Boundaries

## Purpose
`orchestration/` defines the **pipeline execution contract**: the ordered stages, stage IO
expectations, run lifecycle semantics (start/resume/rerun), and the canonical run-level records
that make execution traceable and reproducible.

This library is the source-of-truth for:
- what stages exist
- what order they run in
- what each stage consumes and produces
- how stage results are reported
- how a run is represented end-to-end (manifest)

## What it governs (in scope)
- **Pipeline definition**: stage list, stage order, activation rules
- **Stage IO contracts**: inputs, outputs, required artifacts, pointers
- **Stage report format**: what every stage must emit (evidence, errors, produced artifacts)
- **Run manifest format**: single record tracking an entire run across stages
- **Run lifecycle semantics**:
  - queued → running → gated → failed → released/closed
  - resume rules
  - partial runs
  - stage reruns and replay rules

## What it does NOT govern (out of scope)
- Gate predicate language / evaluation mechanics → `gates/`
- Risk classes and override policies → `policy/`
- Workspace/projects/pins/adapters/quotas → `system/`
- Intake form schemas and normalization → `intake/`
- Canonical spec schema and unknown handling → `canonical/`
- Standards packs and resolution logic → `standards/`
- Template registry + rendering rules → `templates/`
- Knowledge library selection rules → `knowledge/`
- Planning artifacts (WBS, acceptance maps) → `planning/`
- Verification proof ledger and completion criteria → `verification/`
- Kit packaging rules → `kit/`
- Telemetry event schemas / sinks → `telemetry/`
- Ops standards (SLOs, alert rules) → `ops/`
- Audit ledger definitions → `audit/`

## Consumers (what reads orchestration/)
- Control plane runner (state machine driving stages)
- Stage executors (to know IO contract expectations)
- Gate evaluator (to know what evidence/artifacts should exist at each gate point)
- Operator UI (run timeline, stage status, rerun controls)

## Determinism requirements
- Stage ordering is stable and versioned.
- Stage IO contracts are explicit and machine-checkable.
- Run manifest is append-only for stage events (no silent edits).
- Rerun rules are deterministic (inputs pinned, outputs re-derived).

## Outputs (what orchestration/ produces)
- pipeline definition record(s)
- stage IO contract definitions
- stage report schema and run manifest schema used during execution
