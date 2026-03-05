---
library: planning
id: PLAN-6
schema_version: 1.0.0
status: draft
---

# PLAN-6 — Minimum Viable planning/ Set

## Goal
Define the smallest planning library set required to produce deterministic WBS, acceptance
map, and build plan with enforceable coverage rules.

## Required runtime files (minimum)
### 1) Core docs
- PLAN-0_purpose.md
- PLAN-0_boundary_checklist.md
- PLAN-1_wbs_model.md
- PLAN-1_determinism_rules.md
- PLAN-1_validation_checklist.md
- PLAN-2_acceptance_map_model.md
- PLAN-2_determinism_rules.md
- PLAN-2_validation_checklist.md
- PLAN-3_build_plan_model.md
- PLAN-3_sequencing_policies.md
- PLAN-3_determinism_rules.md
- PLAN-3_validation_checklist.md
- PLAN-4_coverage_model.md
- PLAN-4_determinism_rules.md
- PLAN-4_validation_checklist.md
- PLAN-5_planning_gates.md
- PLAN-5_gate_mapping.md
- PLAN-5_evidence_requirements.md
- PLAN-5_determinism_rules.md
- PLAN-5_validation_checklist.md
- PLAN-6_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/work_breakdown.v1.schema.json
- schemas/acceptance_map.v1.schema.json
- schemas/build_plan.v1.schema.json
- schemas/plan_coverage_rules.v1.schema.json
- schemas/plan_coverage_report.v1.schema.json (optional)

### 3) Registries (runtime defaults)
- registries/plan_coverage_rules.v1.json

### 4) Gate specs (optional)
- PLAN-5_planning_gates.spec.json
