---
library: verification
id: VER-7
schema_version: 1.0.0
status: draft
---

# VER-7 — Minimum Viable verification/ Set

## Goal
Define the smallest verification library set required to record proofs and enforce run completion deterministically.

## Required runtime files (minimum)
### 1) Core docs
- VER-0_purpose.md
- VER-0_boundary_checklist.md
- VER-1_proof_types_model.md
- VER-1_determinism_rules.md
- VER-1_validation_checklist.md
- VER-2_proof_ledger_model.md
- VER-2_determinism_rules.md
- VER-2_validation_checklist.md
- VER-3_command_run_model.md
- VER-3_determinism_rules.md
- VER-3_validation_checklist.md
- VER-4_completion_model.md
- VER-4_determinism_rules.md
- VER-4_validation_checklist.md
- VER-5_command_policy_model.md
- VER-5_determinism_rules.md
- VER-5_validation_checklist.md
- VER-6_verification_gates.md
- VER-6_gate_mapping.md
- VER-6_evidence_requirements.md
- VER-6_determinism_rules.md
- VER-6_validation_checklist.md
- VER-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/proof_types.v1.schema.json
- schemas/proof_ledger.v1.schema.json
- schemas/command_run.v1.schema.json
- schemas/command_run_log.v1.schema.json
- schemas/completion_criteria.v1.schema.json
- schemas/verification_command_policy.v1.schema.json

### 3) Registries (runtime defaults)
- registries/proof_types.v1.json
- registries/completion_criteria.v1.json
- registries/verification_command_policy.v1.json

### 4) Gate specs (optional)
- VER-6_verification_gates.spec.json
