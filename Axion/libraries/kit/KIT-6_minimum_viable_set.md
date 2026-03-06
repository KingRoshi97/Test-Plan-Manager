---
library: kit
id: KIT-6
schema_version: 1.0.0
status: draft
---

# KIT-6 — Minimum Viable kit/ Set

## Goal
Define the smallest kit library set required to package deterministic outputs into a usable,
auditable bundle.

## Required runtime files (minimum)
### 1) Core docs
- KIT-0_purpose.md
- KIT-0_boundary_checklist.md
- KIT-1_kit_tree_model.md
- KIT-1_determinism_rules.md
- KIT-1_validation_checklist.md
- KIT-2_kit_manifest_model.md
- KIT-2_determinism_rules.md
- KIT-2_validation_checklist.md
- KIT-3_versioning_model.md
- KIT-3_compatibility_rules.md
- KIT-3_determinism_rules.md
- KIT-3_validation_checklist.md
- KIT-4_export_rules.md
- KIT-4_determinism_rules.md
- KIT-4_validation_checklist.md
- KIT-5_kit_gates.md
- KIT-5_gate_mapping.md
- KIT-5_evidence_requirements.md
- KIT-5_determinism_rules.md
- KIT-5_validation_checklist.md
- KIT-6_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/kit_manifest.v1.schema.json

### 3) Registries (runtime defaults)
- registries/kit_tree.v1.json
- registries/kit_compatibility.v1.json
- registries/kit_export_filter.v1.json

### 4) Gate specs (optional)
- KIT-5_kit_gates.spec.json
