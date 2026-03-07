---
library: ops
id: OPS-1
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# OPS-1 — Validation Checklist (Monitoring & Alerts)

## Schema Validation
- [ ] Alert rule conforms to `ALRT-01.monitoring_alert_rules.schema.v1.json`
- [ ] `rule_id` follows format `ALRT{NN}-{NN}` (e.g., `ALRT01-01`)
- [ ] `severity` is one of: `critical`, `high`, `med`, `low`
- [ ] `channels` is a non-empty array of strings
- [ ] `cooldown_minutes` is a positive integer
- [ ] `condition` is a non-empty string expression

## Condition Validation
- [ ] Condition references only known metric fields (counters, timings)
- [ ] Condition does not reference wall-clock time or external APIs
- [ ] Condition is syntactically valid as a boolean expression

## Escalation Validation
- [ ] Each severity level maps to a defined escalation tier
- [ ] Critical alerts always trigger T3 escalation

## Registry Validation
- [ ] No duplicate `rule_id` values in the registry
- [ ] All rules have unique identifiers within their ALRT group
- [ ] Registry version field is a valid semver string

## Cross-Reference Validation
- [ ] All channels referenced are supported notification targets
- [ ] Alert rules referenced by ops gates exist in the registry
- [ ] Metric fields used in conditions are defined in the telemetry schema (OBS-01/OBS-02)
