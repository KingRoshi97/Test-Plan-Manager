---
library: canonical
id: CAN-7
schema_version: 1.0.0
status: draft
---

# CAN-7 — Minimum Viable canonical/ Set

## Goal
Define the smallest canonical library set required to build a usable canonical spec
deterministically.

## Required runtime files (minimum)
### 1) Core docs
- CAN-0_purpose.md
- CAN-0_boundary_checklist.md
- CAN-1_entity_model.md
- CAN-1_determinism_rules.md
- CAN-1_validation_checklist.md
- CAN-2_id_rules.md
- CAN-2_id_generation_spec.md
- CAN-2_dedupe_rules.md
- CAN-2_determinism_rules.md
- CAN-2_validation_checklist.md
- CAN-3_reference_integrity.md
- CAN-3_integrity_checks.md
- CAN-3_determinism_rules.md
- CAN-3_validation_checklist.md
- CAN-4_unknowns_assumptions_model.md
- CAN-4_rules.md
- CAN-4_determinism_rules.md
- CAN-4_validation_checklist.md
- CAN-5_artifacts.md
- CAN-5_manifest_requirements.md
- CAN-5_determinism_rules.md
- CAN-5_validation_checklist.md
- CAN-6_canonical_gates.md
- CAN-6_gate_mapping.md
- CAN-6_evidence_requirements.md
- CAN-6_determinism_rules.md
- CAN-6_validation_checklist.md
- CAN-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/canonical_spec.v1.schema.json
- schemas/unknown_assumptions.v1.schema.json
- schemas/canonical_build_report.v1.schema.json

### 3) Registries (runtime defaults)
- registries/id_rules.v1.json (optional but recommended)
- registries/relationship_constraints.v1.json

### 4) Gate specs (optional)
- CAN-6_canonical_gates.spec.json
