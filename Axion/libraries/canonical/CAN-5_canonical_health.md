---
library: canonical
id: CAN-5-GOV
title: Canonical Health
schema_version: 1.0.0
status: draft
---

# CAN-5 — Canonical Health

## Purpose

This document defines the health metrics, scoring methodology, and validation checklist for assessing canonical spec quality. It covers entity coverage, provenance distribution, stale entity detection, and downstream impact analysis.

## Health Metrics

### Entity Coverage

| Metric | Formula | Target |
|---|---|---|
| Total entities | Count of all canonical entities | Project-dependent |
| Typed coverage | Entities with valid `entity_type` / Total entities | 100% |
| Attributed coverage | Entities with at least one non-empty attribute / Total entities | >= 90% |
| Relationship coverage | Entities participating in at least one relationship / Total entities | >= 80% |

### Provenance Distribution

| Metric | Formula | Healthy Range |
|---|---|---|
| Hard fact ratio | `hard_fact` entities / Total entities | >= 60% |
| Inferred fact ratio | `inferred_fact` entities / Total entities | <= 30% |
| Unresolved unknown ratio | `unresolved_unknown` entities / Total entities | <= 10% |
| Evidence completeness | Entities with valid evidence per their class / Total entities | 100% |

### Stale Entities

| Metric | Formula | Threshold |
|---|---|---|
| Stale entity count | Entities not re-resolved since last intake change | 0 (ideal) |
| Resolution age | Current time - `last_resolved_at` per entity | <= 1 resolution cycle |
| Orphaned entities | Entities with no downstream dependencies declared | 0 |

### Downstream Impact

| Metric | Formula | Description |
|---|---|---|
| High-impact entities | Entities with >= 3 downstream dependencies | Monitor for stability |
| Invalidation risk score | Sum of downstream artifact counts for `unresolved_unknown` entities | Lower is better |
| Cascade depth | Maximum chain length through dependency graph | Monitor for complexity |

## Validation Checklist

### Structural Validation

- [ ] All entities have valid `entity_id` matching pattern `E-[A-Z0-9]{6,}`
- [ ] All entities have a valid `entity_type` from the allowed enum
- [ ] All entities have a non-empty `name`
- [ ] All relationships reference existing entity IDs (no dangling refs)
- [ ] All relationship types are from the allowed enum

### Provenance Validation

- [ ] Every entity has an assigned `provenance_class`
- [ ] Every `hard_fact` has at least one direct source reference
- [ ] Every `inferred_fact` has an inference rule and input fact references
- [ ] Every `unresolved_unknown` has a gap description
- [ ] No provenance class changes exist without a corresponding decision report

### Governance Validation

- [ ] Every entity has at least one downstream dependency declared
- [ ] All decision reports are present for the current resolution version
- [ ] No stale entities remain from prior resolution cycles
- [ ] Downstream invalidation has been computed for all breaking changes
- [ ] Canonical spec version follows semantic versioning rules

### Health Score Computation

The overall canonical health score is computed as:

```
health_score = (
  (typed_coverage * 0.15) +
  (attributed_coverage * 0.15) +
  (relationship_coverage * 0.10) +
  (hard_fact_ratio * 0.20) +
  (evidence_completeness * 0.20) +
  ((1 - unresolved_unknown_ratio) * 0.10) +
  ((1 - stale_entity_ratio) * 0.10)
)
```

| Score Range | Health Status |
|---|---|
| >= 0.90 | Healthy |
| 0.75 - 0.89 | Acceptable |
| 0.50 - 0.74 | Degraded |
| < 0.50 | Critical |

## Governance Rules

1. Canonical health MUST be computed after every resolution cycle.
2. A health score below `Acceptable` MUST block downstream stage execution unless overridden.
3. All validation checklist items MUST pass for a canonical spec to be considered valid.
4. Health metrics MUST be included in gate evaluation reports (S8).
