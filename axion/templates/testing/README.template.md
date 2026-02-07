<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:testing -->
<!-- AXION:PREFIX:test -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Testing — AXION Module Template (Blank State)

**Module slug:** `testing`  
**Prefix:** `test`  
**Description:** Test strategies, coverage, and automation

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:TEST_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the testing module.
"Owns" = test strategy, test infrastructure, coverage standards, CI test gates, test data management, test reporting.
"Does NOT own" = individual module test implementations (each module owns its own tests), application code (all other modules).
Common mistake: testing module writing all tests — it sets policy and provides infrastructure; each module writes and maintains its own tests. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:TEST_STRATEGY -->
## Test Strategy
<!-- AGENT: Derive from TESTPLAN for overall test approach and RPBS §7 for quality requirements.
Testing pyramid = ratio of unit:integration:E2E tests, justification for the chosen balance (e.g., "heavy unit tests for business logic, light E2E for critical paths").
Risk-based priorities = which areas get the most test investment based on business risk (e.g., payment flows, auth, data integrity).
Common mistake: inverting the test pyramid (too many E2E, too few unit tests) — this leads to slow, flaky test suites. -->
- Testing pyramid for this product: [TBD]
- Risk-based coverage priorities: [TBD]


<!-- AXION:SECTION:TEST_TYPES -->
## Test Types & Coverage
<!-- AGENT: Derive from TESTPLAN for each test type's scope and RPBS §7 for performance targets.
Unit = what's tested (pure functions, reducers, validators), tooling (Jest/Vitest), coverage target per module.
Integration = what's tested (API routes with DB, service interactions), test database strategy, fixture management.
E2E = critical user journeys from RPBS §5, browser automation tool, device/browser matrix.
Contract = module boundary verification (frontend↔backend), tooling (Pact or similar).
Performance = load testing targets from RPBS §7 NFRs, tools (k6/Artillery), baseline benchmarks.
Common mistake: not defining coverage targets per test type — each type needs a measurable quality gate. -->
- Unit: [TBD]
- Integration: [TBD]
- E2E: [TBD]
- Contract: [TBD]
- Performance: [TBD]


<!-- AXION:SECTION:TEST_ENV -->
## Test Environments & Data
<!-- AGENT: Derive from devops module environment list and RPBS §8 for data privacy in test environments.
Environments = which environments run which test types (local: unit+integration, CI: all, staging: E2E+performance).
Test data = how test data is created (factories, fixtures, seeded databases), how PII is handled in test environments (anonymized, synthetic).
Common mistake: using production data in test environments without anonymization — always use synthetic or anonymized data. -->
- Environments used: [TBD]
- Test data management: [TBD]


<!-- AXION:SECTION:TEST_AUTOMATION -->
## Automation & CI Integration
<!-- AGENT: Derive from devops module CI/CD pipeline configuration.
Runner strategy = how tests are parallelized (by file, by test type, sharded), timeout limits per test suite, resource allocation.
Flake policy = how flaky tests are handled (quarantine, auto-retry count, maximum flake rate before investigation required).
Common mistake: allowing flaky tests to persist — flaky tests erode confidence in the test suite and should be quarantined immediately. -->
- Runner strategy (parallelization): [TBD]
- Flake policy: [TBD]


<!-- AXION:SECTION:TEST_REPORTING -->
## Reporting & Signals
<!-- AGENT: Derive from TESTPLAN for quality gates and RPBS §7 for acceptance thresholds.
Coverage targets = minimum coverage percentages (line, branch, function) overall and per module, with justification for chosen thresholds.
Gate thresholds = what must pass before merging (all tests green, coverage >= X%, no new security findings, performance within budget).
Common mistake: setting coverage targets without enforcement — gates must be automated in CI, not manually checked. -->
- Coverage targets: [TBD]
- Gate thresholds: [TBD]


<!-- AXION:SECTION:TEST_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Test types defined with owners
- [ ] CI gates specified
- [ ] Data strategy documented


<!-- AXION:SECTION:TEST_OPEN_QUESTIONS -->
## Open Questions
<!-- AGENT: Capture unresolved testing decisions or missing upstream information.
Each question should reference which upstream source is needed (e.g., "Awaiting TESTPLAN finalization for E2E scope").
Common mistake: leaving questions vague — each should be specific and actionable. -->
- [TBD]
