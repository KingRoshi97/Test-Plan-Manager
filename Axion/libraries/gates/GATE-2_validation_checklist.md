---
library: gates
id: GATE-2
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# GATE-2 — Validation Checklist (DSL)

## Function Registry Validation
- [ ] All DSL functions listed in the registry have unique names
- [ ] Each function declares argument count (min, max)
- [ ] Each function declares argument types
- [ ] Each function has a description
- [ ] No function name conflicts with reserved words (`and`, `or`, `not`, `true`, `false`)

## Expression Structure Validation
- [ ] Every predicate conforms to the Predicate schema (one of: OpCall, BoolLiteral, And, Or, Not)
- [ ] `and` arrays contain at least 1 element
- [ ] `or` arrays contain at least 1 element
- [ ] `not` contains exactly 1 predicate
- [ ] Nesting depth does not exceed 10

## OpCall Validation
- [ ] `op` references a registered DSL function
- [ ] `args` count matches function's declared argument count
- [ ] `args` types match function's declared argument types
- [ ] No argument is null or undefined

## Determinism Validation
- [ ] No DSL function references wall-clock time
- [ ] No DSL function makes external API calls
- [ ] No DSL function uses random values
- [ ] No DSL function mutates global state
- [ ] All DSL functions are pure (read-only)

## Integration Validation
- [ ] All predicates in all gate definitions pass expression validation
- [ ] DSL function registry version is recorded in run manifest
