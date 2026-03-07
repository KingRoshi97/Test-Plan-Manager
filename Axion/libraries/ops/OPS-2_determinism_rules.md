---
library: ops
id: OPS-2
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# OPS-2 — Determinism Rules (Logging & Tracing)

## Invariants

1. **Schema stability**: The set of required log fields is fixed for a given schema version.
   Adding or removing required fields requires a schema version bump.

2. **Redaction determinism**: The redaction pattern list is versioned and pinned per run.
   The same log content processed through the same redaction version produces the same output.

3. **Level semantics**: The meaning of each log level (`debug`, `info`, `warn`, `error`)
   is fixed and must not be reinterpreted between runs.

4. **Correlation ID propagation**: `trace_id` and `run_id` are assigned at run start and
   propagated to every log entry. They must not change mid-run.

5. **Field completeness**: Every log entry must include all required fields. Missing
   required fields are a validation error.

## What is NOT deterministic (by design)
- The **content** of `message` varies per run based on the actual events.
- The **timestamp** (`ts`) reflects wall-clock time at emission.
- The **volume** of log entries depends on pipeline activity and log level configuration.

## Verification
- Log field completeness can be validated by schema check.
- Redaction effectiveness can be verified by scanning persisted logs for known patterns.
