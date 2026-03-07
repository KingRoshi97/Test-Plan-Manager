---
library: standards
doc_id: STD-3_standards_compatibility
title: Standards Compatibility
version: 1.0.0
status: draft
---

# STD-3 — Standards Compatibility

## Purpose

Defines how standards units declare compatibility with each other, specify version constraints, and express cross-library dependencies. Ensures that co-selected standards do not produce invalid or contradictory configurations.

## Compatibility Labels

Every standard unit MAY declare compatibility labels against other units:

| Label | Meaning |
|---|---|
| `compatible` | Units can coexist without conflict. |
| `incompatible` | Units MUST NOT be active simultaneously in the same context. |
| `conditional` | Units can coexist only if specified conditions are met. |
| `unknown` | No compatibility assessment has been performed (default). |

Labels are directional: Unit A declaring `compatible` with Unit B does not imply B declares the same for A. Resolution engines MUST treat the relationship as `unknown` unless both sides agree.

## Compatibility Declarations

Each unit MAY include a `compatibility` array:

```json
{
  "compatibility": [
    {
      "target_unit_id": "STDU-AUTH_BASELINE",
      "label": "compatible",
      "version_constraint": ">=1.0.0 <3.0.0",
      "conditions": [],
      "notes": "Fully compatible with auth baseline v1.x and v2.x."
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `target_unit_id` | string | yes | The unit being referenced. |
| `label` | enum | yes | One of the compatibility labels. |
| `version_constraint` | string | no | SemVer range expression constraining the target version. |
| `conditions` | array | no | Predicate expressions that must hold for the label to apply. |
| `notes` | string | no | Human-readable explanation. |

## Version Constraints

Version constraints use SemVer range syntax:

| Syntax | Meaning |
|---|---|
| `>=1.0.0` | Version 1.0.0 or higher. |
| `<3.0.0` | Below version 3.0.0. |
| `>=1.0.0 <3.0.0` | Between 1.0.0 (inclusive) and 3.0.0 (exclusive). |
| `^2.0.0` | Compatible with 2.x.x (>=2.0.0 <3.0.0). |
| `~1.2.0` | Patch-level changes (>=1.2.0 <1.3.0). |
| `*` | Any version. |

When no constraint is specified, `*` is assumed.

## Cross-Library Dependencies

Standards may depend on artifacts in other Axion libraries:

| Dependency Type | Target Library | Example |
|---|---|---|
| `gate_dependency` | gates | Standard requires a specific gate definition to exist. |
| `template_dependency` | templates | Standard requires a template to be available. |
| `proof_dependency` | verification | Standard requires a proof type to be registered. |
| `policy_dependency` | policy | Standard depends on a policy rule. |
| `canonical_dependency` | canonical | Standard references a canonical schema field. |

Cross-library dependencies are declared as:

```json
{
  "cross_library_deps": [
    {
      "library": "gates",
      "artifact_id": "GATE-SEC-001",
      "version_constraint": ">=1.0.0",
      "required": true,
      "description": "Requires security gate for enforcement."
    }
  ]
}
```

## Validation Rules

1. All `target_unit_id` references MUST resolve to entries in the standards registry.
2. `version_constraint` MUST be valid SemVer range syntax.
3. If label is `incompatible`, the resolver MUST NOT include both units in the same resolved set.
4. If label is `conditional`, `conditions` MUST be non-empty.
5. Cross-library dependencies with `required: true` MUST be satisfiable at resolution time; unsatisfiable dependencies produce an `unresolved` verdict.
6. Circular compatibility conditions are forbidden.
