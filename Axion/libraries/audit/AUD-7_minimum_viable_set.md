---
library: audit
id: AUD-7
schema_version: 1.0.0
status: draft
---

# AUD-7 — Minimum Viable audit/ Set

## Goal
Define the smallest audit library set required to record accountable operator actions with
deterministic integrity and operational handling.

## Required runtime files (minimum)
### 1) Core docs
- AUD-0_purpose.md
- AUD-0_boundary_checklist.md
- AUD-1_audit_action_model.md
- AUD-1_determinism_rules.md
- AUD-1_validation_checklist.md
- AUD-2_audit_log_model.md
- AUD-2_tamper_evident_rules.md
- AUD-2_determinism_rules.md
- AUD-2_validation_checklist.md
- AUD-3_audit_index_model.md
- AUD-3_determinism_rules.md
- AUD-3_validation_checklist.md
- AUD-4_integrity_model.md
- AUD-4_hash_chain_rules.md
- AUD-4_determinism_rules.md
- AUD-4_validation_checklist.md
- AUD-5_audit_gates.md
- AUD-5_evidence_requirements.md
- AUD-5_determinism_rules.md
- AUD-5_validation_checklist.md
- AUD-6_ops_workflow.md
- AUD-6_redaction_export_rules.md
- AUD-6_determinism_rules.md
- AUD-6_validation_checklist.md
- AUD-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/audit_action.v1.schema.json
- schemas/audit_log.v1.schema.json
- schemas/audit_index.v1.schema.json

### 3) Registries (runtime defaults)
- registries/audit_integrity.v1.json
- registries/audit_ops_policy.v1.json

### 4) Gate specs (optional)
- AUD-5_audit_gates.spec.json
