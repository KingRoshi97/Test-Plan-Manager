---
library: gates
id: GAT-6
section: gate_health
schema_version: 1.0.0
status: draft
governance_layer: true
complements: GATE-6
---

# GAT-6 — Gate Health

## Overview
GAT-6 defines the health metrics, staleness detection, validation checklist, and definition of
done for the gates governance layer. Gate health ensures that the gate library remains accurate,
current, and effective over time.

## Health Metrics

### Gate-Level Metrics

| Metric | Description | Target |
|---|---|---|
| `evaluation_count` | Total evaluations in the last 30 days | > 0 for active gates |
| `pass_rate` | Percentage of evaluations that passed | Context-dependent |
| `false_positive_rate` | Percentage of failures that were overridden | < 5% |
| `false_negative_rate` | Percentage of passes where issues were found downstream | < 1% |
| `mean_evaluation_time_ms` | Average evaluation duration | < 500ms |
| `evidence_availability_rate` | Percentage of evaluations with all evidence available | > 99% |
| `replay_success_rate` | Percentage of replays producing identical verdicts | 100% |
| `drift_incidents` | Number of drift incidents in the last 90 days | 0 |

### Library-Level Metrics

| Metric | Description | Target |
|---|---|---|
| `total_active_gates` | Number of gates in `active` status | >= minimum viable set |
| `stage_coverage` | Percentage of pipeline stages with at least one gate | 100% |
| `schema_compliance_rate` | Percentage of gates passing schema validation | 100% |
| `registry_completeness` | Percentage of gates with all required governance fields | 100% |
| `documentation_coverage` | Percentage of gates with complete documentation | 100% |
| `proven_maturity_ratio` | Percentage of active gates at `proven` maturity | > 50% |

## Staleness Detection

### Staleness Rules

| Condition | Staleness Level | Action |
|---|---|---|
| Gate not evaluated in 30 days | `stale` | Review gate applicability; may not be needed |
| Gate definition not updated in 180 days | `review_due` | Confirm definition is still accurate |
| Gate evidence policy references deprecated evidence types | `outdated` | Update evidence policy |
| Gate predicates reference deprecated DSL functions | `outdated` | Update predicates |
| Gate has no canonical test vectors | `incomplete` | Create test vectors |

### Staleness Response
1. Staleness is detected by automated health checks.
2. Gate owner is notified of the staleness condition.
3. Owner reviews and either updates the gate or confirms it is still valid.
4. If no response within 30 days, gate is flagged for governance review.
5. Governance review may deprecate or retire persistently stale gates.

## Validation Checklist

### Per-Gate Validation
- [ ] Gate has a valid `unit_id` matching the required pattern.
- [ ] Gate has all required governance fields populated.
- [ ] Gate definition validates against `gate_unit.v1.schema.json`.
- [ ] Gate has a declared evidence policy with all required fields.
- [ ] Gate has a valid `stage_binding` referencing a recognized stage.
- [ ] Gate has at least one `risk_classes` entry.
- [ ] Gate predicates use only recognized DSL functions.
- [ ] Gate has canonical test vectors (required for `proven` maturity).
- [ ] Gate decision reports validate against `gate_decision_report.v1.schema.json`.

### Library-Level Validation
- [ ] All pipeline stages have at least one active gate.
- [ ] No duplicate `gate_id` values in the registry.
- [ ] All `deprecated` gates have `superseded_by` references.
- [ ] Registry integrity hash matches computed hash.
- [ ] Schema registry contains entries for all gate schemas.
- [ ] Library index contains entries for gate registries.

## Definition of Done

The gates governance layer is "done" when all of the following criteria are met:

### Documentation Complete
- [ ] GAT-0: Governance purpose and principles documented.
- [ ] GAT-1: Gate registry rules, ID stability, versioning, maturity tiers documented.
- [ ] GAT-2: Applicability rules, stage bindings, risk class filtering documented.
- [ ] GAT-3: Decision report model, explainability, operator review documented.
- [ ] GAT-4: Evidence requirements, replay contract, deterministic evaluation documented.
- [ ] GAT-5: Backward compatibility tiers, drift detection, enforcement consistency documented.
- [ ] GAT-6: Health metrics, staleness detection, validation checklist, definition of done documented.

### Schemas Complete
- [ ] `gate_unit.v1.schema.json` — governed gate unit schema.
- [ ] `gate_decision_report.v1.schema.json` — gate decision report schema.

### Registries Complete
- [ ] Governed gate registry with governance envelope fields.

### Integration Complete
- [ ] Gate schemas registered in schema registry.
- [ ] Gate registries registered in library index.
- [ ] API endpoints serve governance data.
- [ ] UI displays governance status and health metrics.

### Health Targets Met
- [ ] All active gates pass schema validation.
- [ ] All pipeline stages have gate coverage.
- [ ] Replay verification produces consistent results.
- [ ] No unresolved drift incidents.
