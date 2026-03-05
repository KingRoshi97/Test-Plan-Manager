---
library: gates
id: GATE-2
section: expression_validation_rules
schema_version: 1.0.0
status: draft
---

# GATE-2 — Expression Validation Rules

## Overview
Every predicate expression must be validated before evaluation. Invalid expressions are
rejected at gate definition load time, not at evaluation time.

## Validation Rules

### 1. Function Reference Validation
- Every `op` in an `OpCall` must reference a function registered in the DSL function registry.
- Unknown function names are a fatal validation error.

### 2. Argument Count Validation
- Each DSL function declares its expected argument count (min, max).
- An `OpCall` with too few or too many arguments is a validation error.

### 3. Argument Type Validation
- Each DSL function declares its argument types.
- Arguments must match declared types:
  - `string` arguments must be string literals
  - `number` arguments must be numeric literals
  - `boolean` arguments must be boolean literals

### 4. Composition Validation
- `and` and `or` must contain at least one operand.
- `not` must contain exactly one operand.
- Operands must themselves be valid predicates (recursive validation).

### 5. Nesting Depth Limit
- Predicate nesting must not exceed 10 levels.
- Exceeding the depth limit is a validation error.

### 6. No Side Effects
- DSL functions must be pure: they read state but do not modify it.
- Functions that would modify artifacts, state, or external systems are prohibited.

### 7. Determinism Constraint
- No DSL function may depend on:
  - Current wall-clock time
  - Random values
  - External API calls
  - Mutable global state

## Error Reporting
Validation errors include:
- The gate_id containing the invalid expression
- The path within the predicate tree to the error
- The specific validation rule violated
- A human-readable error message
