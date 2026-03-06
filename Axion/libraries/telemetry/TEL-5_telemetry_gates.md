---
library: telemetry
id: TEL-5
schema_version: 1.0.0
status: draft
---

# TEL-5 — Telemetry Gates

## Purpose
Ensure telemetry is schema-valid, safe, and policy compliant.

## Gate set (minimum)

### TEL-GATE-01 — Event types registry pinned + valid
- telemetry_event_types registry pinned
- validates against telemetry_event_types.v1

### TEL-GATE-02 — Emitted events validate against base schema
- telemetry events validate against telemetry_event_base.v1
- event_type values exist in telemetry_event_types (strict mode)

### TEL-GATE-03 — Sink policy pinned + valid
- telemetry_sink_policy registry pinned
- validates against telemetry_sink_policy.v1

### TEL-GATE-04 — Redaction compliance
- deny_keys removed
- deny_patterns scrubbed
- external_strict_mode enforced for external sinks

### TEL-GATE-05 — Telemetry non-interference
- telemetry failures must not fail the run by default
- if strict mode enabled, failures can warn/pause (policy controlled)
