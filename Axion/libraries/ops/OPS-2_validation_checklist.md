---
library: ops
id: OPS-2
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# OPS-2 — Validation Checklist (Logging & Tracing)

## Schema Validation
- [ ] Log entry contains all required fields: `ts`, `level`, `message`, `run_id`, `stage_id`, `trace_id`, `span_id`
- [ ] `level` is one of: `debug`, `info`, `warn`, `error`
- [ ] `ts` is a valid ISO 8601 timestamp string
- [ ] `run_id` is a non-empty string matching run identifier format
- [ ] `trace_id` and `span_id` are non-empty strings

## Correlation Validation
- [ ] All log entries within a run share the same `run_id`
- [ ] All log entries within a run share the same `trace_id`
- [ ] Each stage produces a unique `span_id`
- [ ] `gate_id` is present on all gate evaluation log entries
- [ ] `artifact_id` is present on all artifact-related log entries

## Redaction Validation
- [ ] Redaction filter is active before log persistence
- [ ] All configured patterns are applied to log output
- [ ] No AWS access key patterns appear in persisted logs
- [ ] No private key blocks appear in persisted logs
- [ ] No password/token assignment patterns appear in persisted logs

## Registry Validation
- [ ] Logging standards document validates against its schema
- [ ] Required log fields list matches the canonical set
- [ ] Redaction patterns list is non-empty
- [ ] Constraint rules have unique `rule_id` values

## Cross-Reference Validation
- [ ] `stage_id` values in logs reference valid pipeline stages
- [ ] `gate_id` values in logs reference valid gate definitions
- [ ] Telemetry events (OBS-01) include the same correlation fields
