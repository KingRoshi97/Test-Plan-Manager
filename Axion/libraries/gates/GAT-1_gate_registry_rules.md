---
library: gates
id: GAT-1
section: gate_registry_rules
schema_version: 1.0.0
status: draft
governance_layer: true
complements: GATE-1
---

# GAT-1 — Gate Registry Rules

## Overview
GAT-1 defines the rules governing how gates are registered, identified, versioned, and maintained
in the governed gate registry. Every gate that participates in an Axion pipeline run must be
registered according to these rules.

## Registration Protocol

### Required Fields
Every governed gate unit must include:

| Field | Type | Required | Description |
|---|---|---|---|
| `unit_id` | string | yes | Stable identifier matching `^GAT-[A-Z0-9_]+$` pattern |
| `gate_id` | string | yes | Runtime gate identifier (e.g., `G1_INTAKE_VALIDITY`) |
| `title` | string | yes | Human-readable gate name |
| `version` | string | yes | Semantic version of this gate definition |
| `status` | enum | yes | `draft`, `active`, `deprecated`, `retired` |
| `owner` | string | yes | Team or individual responsible for this gate |
| `created_at` | string | yes | ISO 8601 creation timestamp |
| `updated_at` | string | yes | ISO 8601 last-modified timestamp |
| `predicate_maturity` | enum | yes | `experimental`, `stable`, `proven` |
| `stage_binding` | string | yes | Pipeline stage this gate is bound to |
| `severity` | enum | yes | `blocker` or `warning` |
| `evidence_policy` | object | yes | Evidence requirements for evaluation |

### ID Stability Rules
- `unit_id` is assigned at registration and MUST NOT change for the lifetime of the gate.
- `gate_id` is the runtime execution identifier and MUST remain stable across versions.
- If a gate is replaced, the old gate is marked `deprecated` with a `superseded_by` reference.

## Versioning Rules

### Semantic Versioning
Gates follow semantic versioning (`MAJOR.MINOR.PATCH`):
- **MAJOR**: Breaking change to predicates, evidence requirements, or severity.
- **MINOR**: New predicates added, evidence policy expanded (backward compatible).
- **PATCH**: Documentation fixes, description updates, no behavioral change.

### Version Lineage
- Each gate version records its `previous_version` for lineage tracking.
- The registry maintains the full version history for audit purposes.
- Only one version of a gate may be `active` at any time.

## Predicate Maturity Tiers

| Tier | Definition | Promotion Criteria |
|---|---|---|
| `experimental` | New predicate, may produce false positives/negatives | Registered, basic testing |
| `stable` | Reliable predicate, validated against representative inputs | 10+ successful evaluations, no false positives in production |
| `proven` | Battle-tested, high-confidence predicate | 100+ evaluations, zero drift incidents, operator trust established |

### Promotion Rules
- Gates start at `experimental` maturity.
- Promotion requires evidence of evaluation history and accuracy.
- Demotion is allowed if regression is detected (with incident record).

## Registration Workflow
1. Author creates gate definition following GATE-1 model.
2. Gate is added to governed registry with `status: draft`, `predicate_maturity: experimental`.
3. Review confirms schema compliance, predicate correctness, evidence policy completeness.
4. Gate is promoted to `status: active` after review approval.
5. Gate enters production evaluation pipeline.

## Determinism Rules
- The registry is the single source of truth for gate definitions within a run.
- Registry state is snapshotted at run start; mid-run changes do not affect the active run.
- Registration order does not affect evaluation order (evaluation order is determined by stage bindings).
