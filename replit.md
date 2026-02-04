# AXION Documentation System - Test Suite

## Overview

This repl is dedicated to developing, enhancing, and testing the AXION documentation-first development system. AXION generates comprehensive "Agent Kits" for AI-guided software development.

## Project Structure

```
/
├── axion/                  # AXION system code
│   ├── config/             # Configuration files (domains, presets, stack profiles)
│   ├── scripts/            # AXION TypeScript CLI scripts (29 scripts)
│   ├── templates/          # Document templates for each module
│   ├── tests/              # Legacy test suites
│   └── docs/               # AXION documentation
├── tests/                  # Vitest test suite
│   ├── unit/               # Unit tests for individual scripts
│   ├── integration/        # Pipeline and module dependency tests
│   ├── validation/         # Template and config validation
│   ├── e2e/                # End-to-end workflow tests
│   └── helpers/            # Test utilities
├── vitest.config.ts        # Vitest configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies (vitest, tsx, typescript)
```

## Running Tests

```bash
# Run all tests
npx vitest run

# Run specific test categories
npx vitest run tests/unit
npx vitest run tests/integration
npx vitest run tests/validation
npx vitest run tests/e2e

# Watch mode for development
npx vitest

# Run with coverage
npx vitest run --coverage

# Run legacy AXION tests
npx tsx axion/tests/helpers/test-runner.ts
```

## Test Coverage

The test suite includes:

### Unit Tests (9 tests)
- Kit creation argument validation
- Kit structure creation
- Manifest generation
- Dry run mode
- Idempotency checks

### Validation Tests (102 tests)
- Script existence and structure
- Template completeness
- Config file validation (domains, presets, stack profiles)

### Integration Tests (8 tests)
- Module dependency graph validation
- Topological ordering
- Pipeline flow
- Config file consistency

### E2E Tests (9 tests)
- Full kit creation workflow
- Kit isolation
- Snapshot integrity
- README generation

## AXION Pipeline Stages

1. **kit-create** - Initialize a new Agent Kit workspace
2. **docs:scaffold** - Generate module documentation structure
3. **docs:content** - Fill documentation with AI-generated content
4. **docs:full** - Run scaffold + content in sequence
5. **app:bootstrap** - Generate application boilerplate

## Running AXION Commands

```bash
# Create a new kit
npx tsx axion/scripts/axion-kit-create.ts --target ./my-kit --project-name MyProject

# Check status
npx tsx axion/scripts/axion-status.ts --build-root ./my-kit

# Run doctor to check system health
npx tsx axion/scripts/axion-doctor.ts
```

## Module System

19 domain modules with defined dependencies:
- **Foundation**: architecture, systems, contracts
- **Data**: database, data
- **Security**: auth
- **Application**: backend, integrations, state, frontend, fullstack
- **Quality**: testing, quality, security, devops, cloud, devex
- **Clients**: mobile, desktop

## Development Notes

- Tests use temp directories in `tests/temp/` which are auto-cleaned
- Test timeout is 30 seconds for long-running kit operations
- Tests run sequentially (fileParallelism: false) for isolation
