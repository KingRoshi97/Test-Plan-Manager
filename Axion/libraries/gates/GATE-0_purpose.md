---
library: gates
id: GATE-0
section: purpose
schema_version: 1.0.0
status: draft
---

# GATE-0 — gates/ Purpose + Boundaries

## Purpose
`gates/` defines the **gate evaluation contract**: the predicate language, evaluation semantics,
evidence requirements, report format, and determinism/replay rules that govern every quality
gate in the Axion pipeline.

This library is the source-of-truth for:
- what a gate is (definition model)
- how gate predicates are expressed (DSL grammar)
- how gates are evaluated at runtime (evaluation engine contract)
- what evidence must be collected and how it is referenced
- how gate results are reported (report model)
- how gate evaluations can be replayed deterministically
- what the minimum viable gate set is for a valid Axion run

## What it governs (in scope)
- **Gate definition model**: gate_id, title, predicates, severity, evidence_policy, override_hook
- **Gate DSL grammar**: predicate functions, composition operators (and/or/not), argument types
- **Evaluation runtime contract**: predicate-by-predicate execution, short-circuit rules, trace emission
- **Evidence collection rules**: what evidence each gate requires, how evidence is referenced
- **Gate report model**: pass/fail verdict, failures list, evidence_refs, override, trace_ref
- **Determinism and replay**: input pinning, replay requests, evidence snapshot requirements
- **Minimum viable gate set**: which gates are required for a valid pipeline run

## What it does NOT govern (out of scope)
- Pipeline stage order and stage IO contracts → `orchestration/`
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

## Consumers (what reads gates/)
- Gate evaluator runtime (predicate evaluation engine)
- Control plane runner (gate pass/fail decisions at stage boundaries)
- Operator UI (gate status display, override controls)
- Audit ledger (gate report references for compliance tracing)

## Determinism requirements
- Gate definitions are versioned and immutable within a run.
- Predicate evaluation is deterministic given the same inputs.
- Evidence references are stable paths or content-addressed hashes.
- Replay produces identical verdicts when given identical inputs.

## Outputs (what gates/ produces)
- Gate definition records (registry of all pipeline gates)
- DSL function catalog (available predicate functions)
- Gate evaluation traces (predicate-by-predicate execution logs)
- Gate reports (pass/fail verdicts with evidence and failure details)
