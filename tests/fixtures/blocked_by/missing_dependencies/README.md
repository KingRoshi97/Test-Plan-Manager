# Fixture: Missing Dependencies

## Scenario
Frontend module is requested for seeding, but its dependencies (contracts, state) have not been verified.

## Expected Behavior
- Status: `blocked_by`
- Stage: `seed`
- Missing: Array containing dependency modules
- Hint: Array of runnable commands to resolve

## Input
A fresh kit created with kit-create, no modules have been run through generate/seed.

## Expected Output
```json
{
  "status": "blocked_by",
  "stage": "seed",
  "module": "frontend",
  "missing": ["contracts", "state"],
  "hint": [
    "node axion/scripts/axion-seed.mjs --build-root <kit> --module contracts",
    "node axion/scripts/axion-seed.mjs --build-root <kit> --module state"
  ]
}
```

## Test Reference
- `tests/core/core-contract.test.ts` - "blocked_by semantics"
