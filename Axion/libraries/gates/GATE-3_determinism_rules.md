---
library: gates
id: GATE-3
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# GATE-3 — Determinism Rules (Evaluation Runtime)

## Invariants

1. **Same inputs → same verdict**: Given identical gate definition, identical artifacts,
   and identical run state, the evaluation must produce the same pass/fail verdict.

2. **Evaluation order is fixed**: Predicates are evaluated in declaration order (array index
   order in the gate definition). This order never changes.

3. **Short-circuit is deterministic**: If a blocker gate's first predicate fails, the same
   predicate will always be the first to fail given the same inputs.

4. **Evidence is deterministic**: The same evaluation produces the same evidence entries
   (same paths, same pointers, same details). Only timestamps may differ.

5. **No ambient state**: The evaluation context is explicit. The runtime does not read
   environment variables, system clock (except for timestamps), or other ambient state
   to make pass/fail decisions.

6. **File reads are snapshot-consistent**: All artifact reads during a single gate evaluation
   use the same file system state. No concurrent writes are permitted during evaluation.

## What is NOT deterministic (by design)
- `evaluated_at` timestamp in the gate report
- Wall-clock duration of evaluation
- Log output ordering (logs are informational, not part of the verdict)

## Replay Guarantee
A replay evaluation (GATE-5) must produce the same verdict as the original evaluation
when given the same:
- Gate definition version
- Artifact snapshot
- Run manifest snapshot
- DSL function registry version
