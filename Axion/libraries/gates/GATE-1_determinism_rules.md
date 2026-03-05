---
library: gates
id: GATE-1
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# GATE-1 — Determinism Rules (Gate Definitions)

## Invariants

1. **Immutability within a run**: Once a run begins, the gate definitions used for that run are
   frozen. Any changes to gate definitions only apply to future runs.

2. **Version pinning**: Gate definitions are versioned. The run manifest records which version
   of the gate registry was used.

3. **Stable identity**: A `gate_id` always refers to the same logical gate. If the gate's
   semantics change, a new version is created — the ID is not reused for a different purpose.

4. **Predicate stability**: Predicates within a gate definition reference stable identifiers
   (artifact paths, schema pointers, DSL function names). No predicate may reference
   transient or non-deterministic values (wall-clock time, random values, external API calls).

5. **Registry completeness**: The gate registry must contain all gates referenced by the
   pipeline definition. Missing gate definitions are a fatal configuration error.

## What is NOT deterministic (by design)
- The **result** of evaluating a gate depends on the run's artifacts, which differ per run.
- Whether an **override** is applied depends on operator action at runtime.
- The **timestamp** in the gate report reflects evaluation time, not definition time.

## Verification
- Gate definition content can be hashed and compared across runs.
- A replay run must use the same gate registry version as the original run.
