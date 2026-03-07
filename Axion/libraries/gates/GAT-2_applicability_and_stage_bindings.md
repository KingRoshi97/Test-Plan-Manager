---
library: gates
id: GAT-2
section: applicability_and_stage_bindings
schema_version: 1.0.0
status: draft
governance_layer: true
complements: GATE-1, GATE-3
---

# GAT-2 — Applicability & Stage Bindings

## Overview
GAT-2 defines the rules governing which gates apply to which pipeline stages, risk classes,
and project types. Applicability is deterministic — given the same project context, the same
set of gates is selected every time.

## Applicability Model

### Gate Applicability Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `stage_binding` | string | yes | Pipeline stage this gate guards (e.g., `intake`, `canonical`, `standards`) |
| `risk_classes` | string[] | yes | Risk classes this gate applies to (e.g., `["mvp", "production", "regulated"]`) |
| `project_types` | string[] | no | Project types this gate applies to. If omitted, applies to all. |
| `domains` | string[] | no | Industry domains this gate applies to. If omitted, applies to all. |
| `conditions` | object | no | Additional applicability conditions (feature flags, environment) |

### Applicability Resolution Algorithm
1. Collect all `active` gates from the governed registry.
2. Filter by `stage_binding` — only gates bound to the current stage are candidates.
3. Filter by `risk_classes` — only gates whose risk class list includes the project's risk class.
4. Filter by `project_types` — if specified, only gates matching the project type. If omitted, gate applies.
5. Filter by `domains` — if specified, only gates matching the project domain. If omitted, gate applies.
6. Evaluate `conditions` — if specified, additional boolean conditions must be met.
7. The resulting set is the **applicable gate set** for the stage.

### Determinism Guarantee
- The algorithm is a pure function of (registry state, project context).
- No randomness, no heuristics, no runtime sampling.
- Given identical inputs, the output is identical.

## Stage Binding Rules

### Valid Stages
Gates may bind to any recognized pipeline stage:
- `intake` — Input validation and normalization
- `canonical` — Canonical spec generation and validation
- `standards` — Standards resolution and compliance
- `planning` — Work breakdown and acceptance mapping
- `generation` — Artifact generation
- `verification` — Proof collection and verification
- `packaging` — Kit assembly and export

### Binding Constraints
- A gate MUST bind to exactly one stage.
- Multiple gates MAY bind to the same stage.
- Gates within a stage are evaluated in `gate_id` numeric order.
- A gate's `stage_binding` MUST NOT change after initial registration (create a new gate instead).

## Risk Class Filtering

### Risk Class Hierarchy
Risk classes form a hierarchy where higher classes include all gates from lower classes:

| Risk Class | Includes Gates From |
|---|---|
| `prototype` | `prototype` only |
| `mvp` | `prototype`, `mvp` |
| `production` | `prototype`, `mvp`, `production` |
| `regulated` | `prototype`, `mvp`, `production`, `regulated` |

### Gate Severity by Risk Class
- In `prototype` and `mvp` risk classes, `warning`-severity gates do not block the pipeline.
- In `production` and `regulated` risk classes, all `blocker` gates must pass; `warning` gates are logged.
- In `regulated` risk class, additional evidence requirements may be imposed by the evidence policy.

## Override Rules by Applicability
- Override eligibility is determined by the gate's `override_hook` AND the project's risk class.
- Gates in `regulated` projects cannot be overridden unless explicitly allowed by policy.
- Override decisions are recorded in the gate decision report with full justification.

## Validation Checklist
- [ ] Every active gate has a valid `stage_binding` referencing a recognized stage.
- [ ] Every active gate has at least one `risk_classes` entry.
- [ ] No gate has an empty `risk_classes` array.
- [ ] Applicability resolution produces identical results for identical inputs.
- [ ] Stage binding has not changed from the gate's initial registration.
