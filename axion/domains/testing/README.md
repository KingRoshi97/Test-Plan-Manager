<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:testing -->
<!-- AXION:PREFIX:test -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Testing — Axion Assembler

**Module slug:** `testing`  
**Prefix:** `test`  
**Description:** Test strategies, coverage, and automation for Axion Assembler

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:TEST_SCOPE -->
## Scope & Ownership
- Owns: Test strategy, test fixtures, E2E test suites, CI integration
- Does NOT own: Application code, AXION scripts

<!-- AXION:SECTION:TEST_STRATEGY -->
## Test Strategy
- Testing pyramid:
  - Unit: Minimal — utility functions only
  - Integration: API endpoint tests with fixture workspaces
  - E2E: Critical user flows via Playwright
- Risk-based priorities:
  1. Lock gate enforcement (must not allow lock without verify pass)
  2. Pipeline execution and log capture
  3. Export generation with correct contents

<!-- AXION:SECTION:TEST_TYPES -->
## Test Types & Coverage

### Unit Tests
- Scope: Utility functions (JSON parsing, path validation)
- Coverage target: N/A for v1

### Integration Tests
- Scope: API endpoints with test database and fixture workspaces
- Tests:
  - Running a stage produces Run record and streams logs
  - blocked_by parsed correctly
  - Lock refuses when verify not PASS
  - Export creates ZIP with manifest

### E2E Tests
- Scope: User flows via Playwright
- Critical paths:
  - Create assembly flow
  - Run pipeline stages
  - Verify center displays violations
  - Export and download

### Contract Tests
- Scope: Verify AXION script output matches expected schema
- Location: Use existing AXION test fixtures

### Performance Tests
- Scope: N/A for v1

<!-- AXION:SECTION:TEST_ENV -->
## Test Environments & Data
- Environments:
  - Local: SQLite or PostgreSQL test database
  - CI: PostgreSQL via GitHub Actions services
- Test data management:
  - Fixture workspaces with known AXION state (seeded, verified, etc.)
  - Database reset between test suites

<!-- AXION:SECTION:TEST_AUTOMATION -->
## Automation & CI Integration
- Runner: Vitest for unit/integration, Playwright for E2E
- Parallelization: E2E tests run sequentially (shared DB state)
- Flake policy: Retry flaky tests once; investigate if fails twice

<!-- AXION:SECTION:TEST_REPORTING -->
## Reporting & Signals
- Coverage targets: N/A for v1
- Gate thresholds: All tests must pass for merge

<!-- AXION:SECTION:TEST_ACCEPTANCE -->
## Acceptance Criteria
- [x] Test types defined with owners
- [x] CI gates specified
- [x] Data strategy documented

<!-- AXION:SECTION:TEST_OPEN_QUESTIONS -->
## Open Questions
- None

## Agent Rules
1. Use fixture workspaces for integration tests; do not require real external services.
2. E2E tests must cover lock gate enforcement.
3. Reset test database between suites.

## ACCEPTANCE
- [x] All [TBD] placeholders populated

## OPEN_QUESTIONS
- None
