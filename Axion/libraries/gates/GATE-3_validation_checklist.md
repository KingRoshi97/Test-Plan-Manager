---
library: gates
id: GATE-3
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# GATE-3 — Validation Checklist (Evaluation Runtime)

## Eval Request Validation
- [ ] `run_id` is a non-empty string
- [ ] `gate_id` references a gate in the registry
- [ ] `context_refs.manifest` points to a valid run manifest
- [ ] `context_refs.artifacts` points to a valid directory
- [ ] `trace_mode` is a boolean (defaults to false)

## Pre-Evaluation Validation
- [ ] Gate definition loaded successfully from registry
- [ ] All predicates pass expression validation (GATE-2)
- [ ] All referenced artifacts exist and are readable
- [ ] Evaluation context is fully resolved

## During Evaluation
- [ ] Each predicate produces at least one evidence entry
- [ ] Short-circuit rules are applied correctly (blocker gates stop on first fail)
- [ ] Warning gates evaluate all predicates regardless of individual failures
- [ ] No predicate modifies artifacts or state (read-only evaluation)
- [ ] Unknown operators produce `E_UNKNOWN_OP` failure code

## Post-Evaluation Validation
- [ ] Gate report conforms to `gate_report.v1.schema.json`
- [ ] Evidence completeness is calculated against evidence policy
- [ ] Gate report is written to the correct path in the run directory
- [ ] Run manifest is updated with gate report reference

## Trace Validation (when trace_mode is enabled)
- [ ] Eval trace conforms to `gate_eval_trace.v1.schema.json`
- [ ] Trace contains one entry per predicate evaluated
- [ ] Each trace entry includes predicate index, result, duration, and evidence
- [ ] Trace is written alongside the gate report
