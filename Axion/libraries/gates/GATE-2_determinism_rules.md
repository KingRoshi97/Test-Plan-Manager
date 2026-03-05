---
library: gates
id: GATE-2
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# GATE-2 — Determinism Rules (DSL)

## Invariants

1. **Pure functions**: Every DSL function is a pure function of its arguments and the
   run's artifact/state snapshot. No side effects, no external calls.

2. **Stable function identity**: A DSL function name always refers to the same evaluation
   logic within a given version. If semantics change, a new version is published.

3. **Argument immutability**: Arguments are evaluated once and passed by value. No
   argument may be a reference to mutable state.

4. **Evaluation order determinism**: Given the same predicate tree and the same inputs,
   evaluation always produces the same result in the same order.

5. **Short-circuit consistency**: `and` short-circuits on the first `false`; `or`
   short-circuits on the first `true`. This order is guaranteed and deterministic.

6. **No implicit defaults**: If a DSL function requires an argument, it must be explicitly
   provided. There are no implicit default values that could vary between environments.

## Registry Versioning
- The DSL function registry is versioned.
- A run pins the DSL function registry version in the run manifest.
- Replay uses the pinned version, not the current version.

## Implications for New Functions
When adding a new DSL function:
- It must be registered in the DSL function registry before use.
- It must not change the behavior of existing functions.
- Its addition increments the registry version.
