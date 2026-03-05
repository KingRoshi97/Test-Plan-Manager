---
library: gates
id: GATE-1
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# GATE-1 — Validation Checklist (Gate Definitions)

## Schema Validation
- [ ] Gate definition conforms to `gate_definition.v1.schema.json`
- [ ] `gate_id` follows format `G{n}_{SNAKE_CASE_NAME}`
- [ ] `stage_id` references a valid pipeline stage
- [ ] `severity` is one of: `blocker`, `warning`
- [ ] `predicates` array is non-empty
- [ ] Each predicate references a registered DSL function

## Evidence Policy Validation
- [ ] `evidence_policy.required_inputs` is a non-empty array of strings
- [ ] `evidence_policy.produced_outputs` is a non-empty array of strings
- [ ] `evidence_policy.proof_types` is a non-empty array of strings
- [ ] All referenced proof types are valid proof type identifiers

## Override Hook Validation (if present)
- [ ] `override_hook.requires_role` is a valid role identifier
- [ ] `override_hook.max_risk_class` is a valid risk class
- [ ] If `override_hook.allowed` is false, no other override fields should be set

## Registry Validation
- [ ] No duplicate `gate_id` values in the registry
- [ ] All gates have unique numeric prefixes
- [ ] Gate ordering matches pipeline stage ordering
- [ ] All `stage_id` values correspond to defined pipeline stages

## Cross-Reference Validation
- [ ] All DSL functions used in predicates exist in the DSL function registry
- [ ] All evidence types referenced are defined in the evidence type catalog
- [ ] All stage_id values map to stages in the orchestration pipeline definition
