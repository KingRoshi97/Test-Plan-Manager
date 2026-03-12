---
library: templates
id: TMP-7
schema_version: 1.0.0
status: draft
---

# TMP-7 — Minimum Viable templates/ Set

## Goal
Define the smallest templates library set required to select and render templates
deterministically with completeness enforcement.

## Required runtime files (minimum)
### 1) Core docs
- TMP-0_purpose.md
- TMP-0_boundary_checklist.md
- TMP-1_template_model.md
- TMP-1_determinism_rules.md
- TMP-1_validation_checklist.md
- TMP-2_registry_model.md
- TMP-2_determinism_rules.md
- TMP-2_validation_checklist.md
- TMP-3_selection_model.md
- TMP-3_selection_rules.md
- TMP-3_determinism_rules.md
- TMP-3_validation_checklist.md
- TMP-4_render_envelope_model.md
- TMP-4_determinism_rules.md
- TMP-4_validation_checklist.md
- TMP-5_completeness_model.md
- TMP-5_placeholder_syntax_rules.md
- TMP-5_evaluation_rules.md
- TMP-5_determinism_rules.md
- TMP-5_validation_checklist.md
- TMP-6_template_gates.md
- TMP-6_gate_mapping.md
- TMP-6_evidence_requirements.md
- TMP-6_determinism_rules.md
- TMP-6_validation_checklist.md
- TMP-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry) — located in SYSTEM/contracts/
- SYSTEM/contracts/template_definition.v1.schema.json
- SYSTEM/contracts/template_registry_entry.v1.schema.json
- SYSTEM/contracts/template_registry.v1.schema.json
- SYSTEM/contracts/template_selection.v1.schema.json
- SYSTEM/contracts/render_envelope.v1.schema.json

### 3) Registries (runtime defaults) — located in SYSTEM/registries/
- SYSTEM/registries/template_registry.v1.json
- SYSTEM/registries/template_category_order.v1.json
- SYSTEM/registries/template_completeness_policy.v1.json

### 4) Gate specs (optional) — located in SYSTEM/contracts/
- SYSTEM/contracts/TMP-6_template_gates.spec.json

## Minimum content requirement
To validate the system end-to-end, the library must include at least:
- 1 template_definition file
- 1 registry entry pointing to it
- 1 selection run that produces TEMPLATE_SELECTION
- 1 rendered output + 1 render envelope
