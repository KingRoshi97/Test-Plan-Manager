---
library: ops
id: OPS-7
section: minimum_viable_ops
schema_version: 1.0.0
status: draft
---

# OPS-7 — Minimum Viable Ops Set

## Goal
Define the smallest ops library set required to ensure operational readiness for an Axion pipeline run.

## Required Runtime Files (Minimum)

### 1) Core Docs
- OPS-0_purpose.md
- OPS-0_boundary_checklist.md
- OPS-1_monitoring_alert_model.md
- OPS-1_determinism_rules.md
- OPS-1_validation_checklist.md
- OPS-2_logging_tracing_model.md
- OPS-2_determinism_rules.md
- OPS-2_validation_checklist.md
- OPS-3_slo_error_budget_model.md
- OPS-3_determinism_rules.md
- OPS-3_validation_checklist.md
- OPS-4_perf_budgets_model.md
- OPS-4_determinism_rules.md
- OPS-4_validation_checklist.md
- OPS-5_cost_quota_model.md
- OPS-5_determinism_rules.md
- OPS-5_validation_checklist.md
- OPS-6_ops_gates_evidence.md
- OPS-6_gate_mapping.md
- OPS-6_determinism_rules.md
- OPS-6_validation_checklist.md
- OPS-7_minimum_viable_ops.md

### 2) Schemas (must be in schema_registry)
- schemas/ALRT-01.monitoring_alert_rules.schema.v1.json
- schemas/COST-01.capacity_cost_model.schema.v1.json
- schemas/OBS-01.telemetry_event.schema.v1.json
- schemas/OBS-02.run_metrics.schema.v1.json
- schemas/ops_unit.v1.schema.json
- schemas/ops_decision_report.v1.schema.json

### 3) Registries (runtime defaults)
- registries/ALRT-01.monitoring_alert_rules.v1.json
- registries/COST-01.capacity_cost_model.v1.json
- registries/LTS-01.logging_tracing_standards.v1.json
- registries/PERF-01.performance_budgets.v1.json
- registries/SLO-01.slo_policy.v1.json
- registries/ops_registry.v1.json
- registries/ops_metrics_catalog.v1.json

### 4) Gate Mapping (optional)
- OPS-6_gate_mapping.md
