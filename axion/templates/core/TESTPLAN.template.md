# Test Plan — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:CORE_DOC:TESTPLAN -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Prefix:** {{DOMAIN_PREFIX}}
**Type:** {{DOMAIN_TYPE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: TESTPLAN defines the testing strategy for a domain. It catalogs every test case
the agent should generate, maps them to features and journeys, and defines acceptance criteria.
When the agent scaffolds an application, this document drives test file generation.

SOURCES TO DERIVE FROM:
1. RPBS §5 User Journeys — every journey step becomes at least one test case
2. RPBS §2 Feature Taxonomy — every MVP feature needs test coverage
3. BELS — policy rules, state machines, and validation rules each need test cases
4. DIM — interfaces need contract tests
5. RPBS §7 Non-Functional Profile — performance targets become benchmark tests
6. RPBS §15 Error Handling — error paths need negative test cases
7. RPBS §33 Success Metrics — KPIs may need automated verification

RULES:
- Test IDs use format: {{DOMAIN_PREFIX}}_TEST_NNN
- Every test MUST have a Priority (P0 = blocks release, P1 = important, P2 = nice-to-have)
- Every test MUST reference its upstream source (RPBS section, BELS rule, DIM interface)
- Coverage target: Every RPBS §5 journey step should have at least one happy-path and one error-path test
- Test types: unit, integration, e2e, contract, performance, accessibility
- Tests should be concrete enough that an agent can generate executable test code from them

CASCADE POSITION (fill priority 9 of 13):
- Upstream (read from): RPBS (§5 journeys, §2 features, §7 non-functional, §15 errors, §33 metrics), BELS (policy rules, state machines, validation rules), DIM (interface contracts), SCREENMAP (screen-level acceptance tests)
- Downstream (feeds into): ERC (P0 acceptance scenarios locked at lock time), test file generation (executable test code from scenarios)
- TESTPLAN consolidates testing requirements from all upstream docs — every rule, interface, and journey step should be reflected here
-->

> Define testing strategy, scenarios, and acceptance criteria for this domain.
> Replace `[TBD]` with concrete content. Use `UNKNOWN` only when upstream truth is missing.

---

## Test Strategy

<!-- AGENT: Define the overall testing approach for this domain.
Consider what types of testing are most valuable given the domain's responsibilities. -->

### Testing Priorities
- **P0 (Critical):** UNKNOWN — tests that MUST pass for any release
- **P1 (Important):** UNKNOWN — tests that should pass but won't block release
- **P2 (Nice-to-have):** UNKNOWN — tests to add as the product matures

### Test Types in Scope
| Type | In Scope? | Tool/Framework | Coverage Target |
|------|----------|---------------|----------------|
| Unit | Yes / No | UNKNOWN | UNKNOWN |
| Integration | Yes / No | UNKNOWN | UNKNOWN |
| E2E | Yes / No | UNKNOWN | UNKNOWN |
| Contract | Yes / No | UNKNOWN | UNKNOWN |
| Performance | Yes / No | UNKNOWN | UNKNOWN |
| Accessibility | Yes / No | UNKNOWN | UNKNOWN |

---

## Acceptance Scenarios

<!-- AGENT: For each RPBS §5 User Journey, create test cases for the happy path and key error paths.
Each test case should be concrete enough to generate a test function from it.
Use Given/When/Then format for clarity.

EXAMPLE:
| Scenario ID | Description | Given | When | Then | Priority | Source |
| fe_TEST_001 | User creates recipe | Authenticated user on /recipes/new | Fills all required fields and clicks Submit | Recipe created, redirect to detail, success toast shown | P0 | RPBS §5 Journey 1 |
| fe_TEST_002 | Empty form submission | Authenticated user on /recipes/new | Clicks Submit without filling fields | Validation errors on title, ingredients; form not submitted | P0 | RPBS §5 Journey 1, §15 |
| fe_TEST_003 | Unauthenticated create attempt | Anonymous user | Navigates to /recipes/new | Redirect to login page | P0 | RPBS §3, §5 |
-->

| Scenario ID | Description | Given | When | Then | Priority | Source |
|------------|-------------|-------|------|------|----------|--------|
| {{DOMAIN_PREFIX}}_TEST_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | P0/P1/P2 | RPBS §_ |

---

## Business Rule Tests

<!-- AGENT: For each BELS policy rule, state machine transition, and validation rule,
create test cases that verify the rule is correctly enforced.

EXAMPLE:
| Test ID | Rule Ref | Type | Description | Input/Setup | Expected Result | Priority |
| be_TEST_010 | be_RULE_001 | unit | Only recipe owner can edit | User A tries to edit User B's recipe | 403 FORBIDDEN_NOT_OWNER | P0 |
| be_TEST_011 | be_SM_001 | unit | Draft → Published transition | Recipe in draft, publish event | State changes to published | P0 |
| be_TEST_012 | be_SM_001 | unit | Deleted → Published blocked | Recipe in deleted, publish event | CANNOT_PUBLISH_DELETED error | P0 |
-->

| Test ID | Rule Ref | Type | Description | Input/Setup | Expected Result | Priority |
|---------|---------|------|-------------|-------------|----------------|----------|
| {{DOMAIN_PREFIX}}_TEST_100 | UNKNOWN | unit | UNKNOWN | UNKNOWN | UNKNOWN | P0/P1/P2 |

---

## Edge Cases

<!-- AGENT: Test boundary conditions, race conditions, and unusual inputs.
Think about: empty collections, maximum-length inputs, concurrent operations,
special characters, timezone boundaries, etc. -->

| Edge Case ID | Description | Expected Behavior | Risk Level |
|-------------|-------------|-------------------|-----------|
| {{DOMAIN_PREFIX}}_EDGE_001 | UNKNOWN | UNKNOWN | High/Medium/Low |

---

## Error Scenarios

<!-- AGENT: For each error category in RPBS §15, define test cases.
Every error code in BELS Reason Codes should have a test that triggers it. -->

| Error ID | Trigger | Expected Error Code | User-Facing Message | Recovery | Source |
|---------|---------|-------------------|-------------------|----------|--------|
| {{DOMAIN_PREFIX}}_ERR_001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | BELS / RPBS §15 |

---

## API Contract Tests

<!-- AGENT: For each DIM exposed interface, create tests verifying request/response contract.

EXAMPLE:
| Test ID | Endpoint | Method | Input | Expected Status | Expected Body Shape | Priority |
| be_TEST_200 | /api/recipes | GET | ?page=1&limit=10 | 200 | { items: Recipe[], total: number } | P0 |
| be_TEST_201 | /api/recipes | POST | { title: "Test" } | 201 | { recipe: Recipe } | P0 |
| be_TEST_202 | /api/recipes | POST | {} (empty) | 400 | { error: "VALIDATION_ERROR" } | P0 |
-->

| Test ID | Endpoint | Method | Input | Expected Status | Expected Body Shape | Priority |
|---------|---------|--------|-------|----------------|--------------------|---------| 
| {{DOMAIN_PREFIX}}_TEST_200 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | P0/P1/P2 |

---

## Performance Criteria

<!-- AGENT: Derive from RPBS §7 Non-Functional Profile. These become benchmark tests. -->

| Metric | Target | Measurement Method | Priority |
|--------|--------|-------------------|----------|
| UNKNOWN | UNKNOWN | UNKNOWN | P1/P2 |

---

## Test Data Requirements

<!-- AGENT: Define test fixtures, factories, and seed data needed. -->

| Fixture | Description | Fields | Notes |
|---------|-------------|--------|-------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Test Environment
- Database: UNKNOWN (in-memory / test database / mock)
- External services: UNKNOWN (mock / sandbox)
- Auth: UNKNOWN (mock user / test tokens)

---

## Coverage Goals

| Area | Target Coverage | Notes |
|------|----------------|-------|
| Unit tests | UNKNOWN | UNKNOWN |
| Integration tests | UNKNOWN | UNKNOWN |
| E2E tests | UNKNOWN | UNKNOWN |

---

## Open Questions
- UNKNOWN
