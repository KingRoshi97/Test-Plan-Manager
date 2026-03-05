---
library: gates
id: GATE-2
section: dsl_grammar
schema_version: 1.0.0
status: draft
---

# GATE-2 — DSL Grammar

## Overview
The Gate DSL (Domain-Specific Language) is a minimal, deterministic predicate language for
expressing gate conditions. It supports function calls, boolean composition, and typed arguments.

## Grammar

### Predicate Types

A predicate is one of:

1. **Function call** (`OpCall`): Invokes a registered DSL function with arguments.
2. **Boolean literal** (`BoolLiteral`): A constant `true` or `false`.
3. **Composition** (`And`, `Or`, `Not`): Combines predicates with boolean logic.

### Function Call Syntax

```json
{
  "op": "has_artifact",
  "args": ["canonical_spec.json"]
}
```

### Composition Syntax

```json
{
  "and": [
    { "op": "has_artifact", "args": ["canonical_spec.json"] },
    { "op": "coverage", "args": ["requirements", 0.8] }
  ]
}
```

```json
{
  "or": [
    { "op": "maturity_at_least", "args": ["prototype"] },
    { "op": "allow_override", "args": ["lead_operator"] }
  ]
}
```

```json
{
  "not": { "op": "has_artifact", "args": ["skip_marker.json"] }
}
```

## Registered DSL Functions

| Function | Arguments | Returns | Description |
|---|---|---|---|
| `has_artifact` | `(path: string)` | boolean | Checks if an artifact exists at the given path |
| `coverage` | `(domain: string, min: number)` | boolean | Checks if coverage for a domain meets the minimum threshold |
| `maturity_at_least` | `(level: string)` | boolean | Checks if the run's maturity level meets the minimum |
| `targets_contains` | `(target: string)` | boolean | Checks if the run's target list includes the specified target |
| `ledger_has` | `(proof_type: string)` | boolean | Checks if the proof ledger contains the specified proof type |
| `allow_override` | `(role: string)` | boolean | Returns true if the specified role can override this gate |

## Argument Types
- `string`: UTF-8 string literal
- `number`: IEEE 754 double-precision float
- `boolean`: `true` or `false`

## Evaluation Order
1. `and`: All operands evaluated left-to-right; short-circuits on first `false`.
2. `or`: All operands evaluated left-to-right; short-circuits on first `true`.
3. `not`: Single operand evaluated and negated.
4. `OpCall`: Function invoked with resolved arguments.
5. `BoolLiteral`: Returns constant value.
