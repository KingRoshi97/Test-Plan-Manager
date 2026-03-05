---
library: policy
id: POL-5
section: minimum_viable_set
schema_version: 1.0.0
status: draft
---

# POL-5 — Minimum Viable policy/ Set

## Goal
Define the smallest policy library set required for deterministic governance.

## Required runtime files (minimum)
### 1) Core docs
- POL-0_purpose.md
- POL-0_boundary_checklist.md
- POL-1_risk_class_model.md
- POL-1_determinism_rules.md
- POL-1_validation_checklist.md
- POL-2_override_policy_model.md
- POL-2_override_rules.md
- POL-2_validation_checklist.md
- POL-3_precedence_model.md
- POL-3_conflict_rules.md
- POL-3_determinism_rules.md
- POL-3_validation_checklist.md
- POL-4_enforcement_points.md
- POL-4_enforcement_matrix.md
- POL-4_determinism_rules.md
- POL-4_validation_checklist.md
- POL-5_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/risk_classes.v1.schema.json
- schemas/policy_set.v1.schema.json
- schemas/override_request.v1.schema.json
- schemas/override_decision.v1.schema.json

### 3) Registries (runtime defaults)
- registries/risk_classes.v1.json
- registries/policy_sets.v1.json
