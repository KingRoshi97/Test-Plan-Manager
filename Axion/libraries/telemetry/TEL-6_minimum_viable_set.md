---
library: telemetry
id: TEL-6
schema_version: 1.0.0
status: draft
---

# TEL-6 — Minimum Viable telemetry/ Set

## Goal
Define the smallest telemetry library set required to emit safe, schema-valid events and compute run metrics without leaking secrets/PII.

## Required runtime files (minimum)
### 1) Core docs
- TEL-0_purpose.md
- TEL-0_boundary_checklist.md
- TEL-1_event_model.md
- TEL-1_determinism_rules.md
- TEL-1_validation_checklist.md
- TEL-2_run_metrics_model.md
- TEL-2_determinism_rules.md
- TEL-2_validation_checklist.md
- TEL-3_sink_policy_model.md
- TEL-3_determinism_rules.md
- TEL-3_validation_checklist.md
- TEL-4_privacy_model.md
- TEL-4_redaction_rules.md
- TEL-4_determinism_rules.md
- TEL-4_validation_checklist.md
- TEL-5_telemetry_gates.md
- TEL-5_determinism_rules.md
- TEL-5_validation_checklist.md
- TEL-6_minimum_viable_set.md
### 2) Schemas (must be in schema_registry)
- schemas/telemetry_event_base.v1.schema.json
- schemas/telemetry_event_types.v1.schema.json
- schemas/run_metrics.v1.schema.json
- schemas/telemetry_sink_policy.v1.schema.json
- schemas/telemetry_privacy_policy.v1.schema.json

### 3) Registries (runtime defaults)
- registries/telemetry_event_types.v1.json
- registries/telemetry_sink_policy.v1.json
- registries/telemetry_privacy_policy.v1.json

### 4) Gate specs (optional)
- TEL-5_telemetry_gates.spec.json
