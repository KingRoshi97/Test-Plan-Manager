---
library: orchestration
id: ORC-7
schema_version: 1.0.0
status: draft
---

# ORC-7 — Minimum Viable orchestration/ Set

## Goal
Define the smallest orchestration library set required to execute runs deterministically.

## Required runtime files (minimum)
### 1) Core docs
- ORC-0_purpose.md
- ORC-0_boundary_checklist.md
- ORC-1_pipeline_definition_model.md
- ORC-1_determinism_rules.md
- ORC-1_validation_checklist.md
- ORC-2_stage_io_contracts.md
- ORC-2_determinism_rules.md
- ORC-2_validation_checklist.md
- ORC-3_run_manifest_model.md
- ORC-3_invariants.md
- ORC-3_validation_checklist.md
- ORC-4_stage_report_model.md
- ORC-4_determinism_rules.md
- ORC-4_validation_checklist.md
- ORC-5_rerun_resume_model.md
- ORC-5_invariants.md
- ORC-5_manifest_events.md
- ORC-5_validation_checklist.md
- ORC-6_orchestration_gates.md
- ORC-6_gate_evidence_format.md
- ORC-6_validation_checklist.md
- ORC-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/pipeline_definition.v1.schema.json
- schemas/stage_io_contract.v1.schema.json
- schemas/stage_io_registry.v1.schema.json
- schemas/run_manifest.v1.schema.json
- schemas/stage_report.v1.schema.json
- schemas/rerun_request.v1.schema.json

### 3) Registries (runtime defaults)
- registries/pipeline_definition.axion.v1.json
- registries/stage_io_registry.axion.v1.json
- registries/rerun_policies.axion.v1.json

### 4) Gate spec
- ORC-6_orchestration_gates.spec.json
