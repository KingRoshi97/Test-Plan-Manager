---
library: ops
id: OPS-6
section: ops_gates_evidence
schema_version: 1.0.0
status: draft
---

# OPS-6 — Ops Gates & Evidence

## Purpose
Define the ops-specific gate checks (OPS-GATE-01 through OPS-GATE-06) that collectively validate operational readiness of a pipeline run. These gates ensure that monitoring, logging, SLOs, performance budgets, and cost models are properly configured before a run is considered operationally sound.

## Gate Overview

| Gate ID | Name | What it checks |
|---------|------|----------------|
| OPS-GATE-01 | Alert Rules Valid | ALRT-01 alert rules validate against schema, escalation tiers defined, thresholds present |
| OPS-GATE-02 | Logging & Tracing Configured | LTS-01 logging standards present, required fields defined, correlation ID policy set |
| OPS-GATE-03 | SLO Policy Enforced | SLO-01 policy validates, objectives have targets, error budgets defined with burn-rate windows |
| OPS-GATE-04 | Performance Budgets Set | PERF-01 budgets validate, stage budgets assigned, profiling thresholds configured |
| OPS-GATE-05 | Cost Model Bound | COST-01 capacity model validates, compute/storage quotas defined, quota hooks configured |
| OPS-GATE-06 | Ops Evidence Complete | All ops artifacts present, cross-references valid, no stale references |

## Evaluation Order
Gates are evaluated in numeric order (OPS-GATE-01 through OPS-GATE-06). A failure in any gate produces actionable evidence with remediation guidance.

## Evidence Produced
Each gate check produces an evidence block containing:
- Gate ID and evaluation timestamp
- Artifacts inspected (file paths and versions)
- Pass/fail verdict with detailed findings
- Remediation steps for any failures
- Cross-references to the ops registry entries evaluated

## Relationship to Pipeline Gates
Ops gates are evaluated as part of overall pipeline readiness. They do not block pipeline progression on their own but contribute evidence to the run's operational readiness assessment. A run may proceed without full ops compliance but will be flagged as operationally incomplete.

## Adding New Ops Gates
New ops gates may be added by:
1. Adding the gate definition to this document.
2. Assigning a numeric suffix that reflects evaluation priority.
3. Updating OPS-6_gate_mapping.md with inputs and pass conditions.
4. Incrementing the ops registry version.
