---
library: standards
id: STD-6
schema_version: 1.0.0
status: draft
---

# STD-6 — Minimum Viable standards/ Set

## Goal
Define the smallest standards library set required to resolve a standards snapshot
deterministically.

## Required runtime files (minimum)
### 1) Core docs
- STD-0_purpose.md
- STD-0_boundary_checklist.md
- STD-1_standards_pack_model.md
- STD-1_determinism_rules.md
- STD-1_validation_checklist.md
- STD-2_standards_index_model.md
- STD-2_applicability_rules.md
- STD-2_determinism_rules.md
- STD-2_validation_checklist.md
- STD-3_resolution_model.md
- STD-3_resolver_order_rules.md
- STD-3_determinism_rules.md
- STD-3_validation_checklist.md
- STD-4_snapshot_model.md
- STD-4_determinism_rules.md
- STD-4_validation_checklist.md
- STD-5_standards_gates.md
- STD-5_gate_mapping.md
- STD-5_evidence_requirements.md
- STD-5_determinism_rules.md
- STD-5_validation_checklist.md
- STD-6_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/standards_pack.v1.schema.json
- schemas/standards_index_entry.v1.schema.json
- schemas/standards_index.v1.schema.json
- schemas/standards_snapshot.v1.schema.json
- schemas/standards_conflict.v1.schema.json (optional)

### 3) Registries (runtime defaults)
- registries/standards_index.v1.json
- packs/<pack files referenced by index> (at least one pack for testing)
- registries/standards_resolver_version.v1.json (optional, if you pin resolver version explicitly)

### 4) Gate specs (optional)
- STD-5_standards_gates.spec.json
