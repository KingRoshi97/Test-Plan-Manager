---
library: intake
id: INT-7
schema_version: 1.0.0
status: draft
---

# INT-7 — Minimum Viable intake/ Set

## Goal
Define the smallest intake library set required to collect inputs and produce deterministic
normalized artifacts.

## Required runtime files (minimum)
### 1) Core docs
- INT-0_purpose.md
- INT-0_boundary_checklist.md
- INT-1_form_spec_model.md
- INT-1_determinism_rules.md
- INT-1_validation_checklist.md
- INT-2_enum_registry_model.md
- INT-2_determinism_rules.md
- INT-2_validation_checklist.md
- INT-3_validation_model.md
- INT-3_determinism_rules.md
- INT-3_validation_checklist.md
- INT-4_submission_record_model.md
- INT-4_determinism_rules.md
- INT-4_validation_checklist.md
- INT-5_stable_id_rules.md
- INT-5_determinism_checklist.md
- INT-5_validation_checklist.md
- INT-6_intake_gates.md
- INT-6_gate_mapping.md
- INT-6_evidence_requirements.md
- INT-6_validation_checklist.md
- INT-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/intake_form_spec.v1.schema.json
- schemas/intake_enums.v1.schema.json
- schemas/intake_cross_field_rules.v1.schema.json
- schemas/intake_submission.v1.schema.json
- schemas/normalized_input.v1.schema.json
- schemas/normalization_rules.v1.schema.json
- schemas/intake_validation_report.v1.schema.json

### 3) Registries (runtime defaults)
- registries/intake_enums.v1.json
- registries/intake_cross_field_rules.v1.json
- registries/normalization_rules.v1.json
- registries/form_spec.axion.v1.json (your actual wizard spec; created from INT-1)
### 4) Gate specs (optional)
- INT-6_intake_gates.spec.json
