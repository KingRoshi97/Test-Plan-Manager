# Test Fixtures

This directory contains fixtures that demonstrate expected AXION behaviors. Each fixture represents a specific scenario that tests can use to validate system contracts.

## Directory Structure

```
fixtures/
├── active_build/
│   ├── missing/              # Kit without ACTIVE_BUILD.json
│   ├── invalid_json/         # ACTIVE_BUILD.json with invalid JSON
│   └── points_to_missing_root/  # ACTIVE_BUILD.json pointing to nonexistent path
├── blocked_by/               # Scenarios that should emit blocked_by status
├── pollution/
│   └── axion_contains_domains/  # Polluted axion snapshot
├── run_lock/
│   └── stale/                # Stale run lock scenarios
├── schema_change/            # Schema migration test data
├── security_gate/            # Security policy violation scenarios
└── README.md
```

## Fixture Guidelines

### Purpose
Fixtures are **example inputs** that demonstrate expected behavior. They help:
- Document what the system should do in specific scenarios
- Provide reproducible test inputs
- Make test intent clear

### Naming Convention
```
{category}/{scenario_name}/
  ├── input/              # Input files/config for the scenario
  ├── expected/           # Expected output/artifacts
  └── README.md           # Describes the scenario and expected outcome
```

### Example: blocked_by Fixture

```
blocked_by/missing_dependencies/
  ├── input/
  │   └── manifest.json   # Kit with frontend module but no contracts
  ├── expected/
  │   └── output.json     # Expected blocked_by response
  └── README.md           # "Frontend should be blocked without contracts"
```

## Using Fixtures in Tests

```typescript
import { loadFixture } from '../helpers/fixture-utils';

describe('blocked_by semantics', () => {
  it('should block frontend when contracts missing', () => {
    const fixture = loadFixture('blocked_by/missing_dependencies');
    const result = runWithFixture(fixture);
    expect(result).toMatchExpected(fixture.expected);
  });
});
```

## Adding New Fixtures

1. Identify the behavior you want to test
2. Create directory under appropriate category
3. Add input files that trigger the behavior
4. Add expected output files
5. Document in README.md
6. Reference in test file
