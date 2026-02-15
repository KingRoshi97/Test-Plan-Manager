# Testing Best Practices

## Testing Pyramid

### Unit Tests (70% of test suite)
- Test individual functions, utilities, and pure business logic
- Fast (< 100ms per test), isolated (no external dependencies)
- Mock external dependencies (database, API calls, file system)
- Naming: `describe('functionName', () => it('should behavior when condition'))`

### Integration Tests (20% of test suite)
- Test API endpoints end-to-end (request → database → response)
- Use a test database (separate from development)
- Reset database state between tests (transactions or truncation)
- Test authentication and authorization flows
- Test error handling and edge cases
- Test real-time integrations (WebSocket connections, event streams)
- Test file upload flows end-to-end (upload → storage → retrieval)

### E2E Tests (10% of test suite)
- Test critical user journeys through the real UI
- Use Playwright (recommended) or Cypress
- Keep E2E tests minimal — test happy paths and critical flows
- Run in CI but don't block deploys for flaky E2E tests (quarantine them)

### E2E Test Coverage Areas
- **Role-based flows**: Test key journeys for each user role (admin, editor, viewer)
- **Navigation flows**: Verify routing, deep links, back/forward navigation, breadcrumbs
- **Offline/poor network flows**: Test graceful degradation with throttled or offline network
- **Accessibility smoke checks**: Run axe-core within E2E tests to catch a11y regressions
- **Cross-browser verification**: Run critical E2E tests across browser matrix

## Test Organization

### File Structure
- Co-locate test files with source: `auth.ts` → `auth.test.ts`
- Or use a `__tests__` directory adjacent to source files
- Shared test utilities in `tests/helpers/` or `tests/fixtures/`

### Test Categories
- Tag tests by category for selective runs: `@unit`, `@integration`, `@e2e`
- Separate fast tests (unit) from slow tests (integration/e2e) in CI
- Run unit tests on every commit, integration on PR, E2E on merge to main

## Writing Good Tests

### Test Structure (AAA Pattern)
```
// Arrange — set up test data and preconditions
// Act — perform the action being tested
// Assert — verify the result
```

### Test Naming
- Describe the behavior, not the implementation
- Good: `it('should return 401 when token is expired')`
- Bad: `it('should call jwt.verify and throw')`

### What to Test
- Happy paths (expected inputs produce expected outputs)
- Error cases (invalid input, missing data, unauthorized access)
- Boundary conditions (empty arrays, zero values, max lengths)
- State transitions (status changes, lifecycle events)

### What NOT to Test
- Third-party library internals (trust their tests)
- Trivial getters/setters with no logic
- Implementation details (private methods, internal state)
- Framework behavior (React rendering, Express routing)

## API Testing

### Request Validation Tests
- Missing required fields → 400
- Invalid field types → 400
- Extra unknown fields → 400 (if strict mode)
- Valid minimal request → 201/200
- Valid full request → 201/200

### Auth Tests
- No token → 401
- Invalid token → 401
- Expired token → 401
- Valid token, wrong permissions → 403
- Valid token, correct permissions → 200

### CRUD Tests
- Create → verify response body and database state
- Read → verify data matches what was created
- Update → verify only changed fields are updated
- Delete → verify resource is gone (or soft-deleted)
- List → verify pagination, filtering, sorting

## Frontend Testing

### Component Tests
- Render with default props and verify output
- Test user interactions (click, type, select)
- Verify conditional rendering (loading, error, empty states)
- Test form validation and submission
- Use `data-testid` attributes for stable selectors

### Expanded Component Testing
- **Snapshot tests**: Use sparingly — only for stable, visual-output components (avoid for dynamic UIs)
- **Reducer/store tests**: Test state transitions independently from UI components
- **Form validation tests**: Test all validation rules, error messages, and edge cases (empty, max length, invalid format)
- **Edge case tests**: Empty data, null values, extremely long strings, special characters, concurrent updates

### Testing Library Best Practices
- Query by role, label, or text first (matches how users find elements)
- Avoid querying by CSS class or tag name
- Use `userEvent` over `fireEvent` (simulates real user behavior)
- Wait for async operations with `waitFor` or `findBy` queries
- Don't test implementation details (state values, component instances)

## Visual Regression Testing

### Component-Level Diffs
- Capture screenshots of individual components in isolation (Storybook + Chromatic or Percy)
- Test each component variant: default, hover, active, disabled, error, loading
- Compare against approved baselines — flag pixel-level differences

### Page-Level Diffs
- Capture full-page screenshots of critical pages
- Test at multiple viewport sizes (mobile, tablet, desktop)
- Include both light and dark mode variants
- Test with different content lengths (short text, long text, empty state)

### Responsive Visual Testing
- Capture at standard breakpoints: 375px, 768px, 1024px, 1440px
- Verify layout doesn't break at intermediate sizes
- Test orientation changes (portrait/landscape) for mobile viewports

### Threshold Management
- Set pixel-diff thresholds per component (stricter for icons, looser for text-heavy pages)
- Anti-aliasing tolerance: allow minor rendering differences across browsers
- Review and approve visual changes as part of the PR process
- Update baselines intentionally, never auto-accept

## Cross-Browser and Device Testing

### Browser Matrix
| Browser | Priority | Min Version |
|---------|----------|-------------|
| Chrome | P0 | Last 2 versions |
| Firefox | P0 | Last 2 versions |
| Safari | P0 | Last 2 versions |
| Edge | P1 | Last 2 versions |
| Mobile Safari (iOS) | P0 | iOS 15+ |
| Chrome (Android) | P0 | Android 10+ |

### Mobile Device Testing
- Test on real devices or cloud device farms (BrowserStack, Sauce Labs)
- Test touch interactions: swipe, pinch-zoom, long press
- Test with on-screen keyboard visible (layout shifts, input visibility)
- Test with screen readers enabled (VoiceOver, TalkBack)

### Responsive Breakpoint Testing
- Verify layout at each defined breakpoint (sm, md, lg, xl, 2xl)
- Test at breakpoint boundaries (e.g., 767px and 768px)
- Verify navigation pattern changes (sidebar ↔ hamburger, tabs ↔ accordion)

## Contract Testing

### API Schema Contracts
- Define API contracts as shared schemas (OpenAPI, Zod, JSON Schema)
- Consumer-driven contracts: frontend defines what it needs, backend validates it provides
- Run contract tests in CI to catch breaking changes before deployment
- Version contracts alongside API versions

### Contract Testing Tools
- Pact for consumer-driven contract testing
- OpenAPI schema validation in tests (validate responses against spec)
- TypeScript shared types as lightweight compile-time contracts

## Mocking Guidelines

### When to Mock
- External HTTP APIs (use MSW or nock)
- Database in unit tests (use repository pattern for clean mocking)
- Time-dependent code (`jest.useFakeTimers()` or `vi.useFakeTimers()`)
- Random values when deterministic output is needed

### When NOT to Mock
- The code under test itself
- Simple utility functions
- Integration tests (use real database, mock only external APIs)

## Test Data Management

### Factories
- Use factory functions to create test data with sensible defaults
- Override only the fields relevant to each test
- Never hardcode IDs or timestamps in assertions (use matchers)
- Libraries: Fishery, Factory.ts, or custom builder pattern

### Fixtures
- Use fixtures for complex data structures that are reused across tests
- Store fixtures as JSON files or factory output
- Version fixtures alongside the code they test
- Keep fixtures minimal — only include fields relevant to tests

### Database Seeding
- Use seeding scripts for consistent initial state in integration/E2E tests
- Seed data should cover all roles, edge cases, and relationship types
- Reset database state between tests: use transactions (fast) or truncation (thorough)
- Never rely on test execution order — each test should be independent

### Database Test Data
- Create fresh data for each test (don't rely on seed data)
- Clean up after tests (use transactions that rollback, or truncate)
- Use realistic data shapes (not `{ name: 'test' }`)

## Maintaining Test Reliability

### Reducing Flaky Tests
- Identify flaky tests: track tests that pass/fail inconsistently in CI
- Common causes: timing issues, shared state, external dependencies, race conditions
- Fix timing issues: use `waitFor`, explicit waits, or polling instead of fixed delays
- Fix shared state: ensure test isolation (reset state before each test)
- Fix external dependencies: mock them or use local test doubles

### Flaky Test Policy
- Track flaky tests and fix within one sprint
- Quarantine flaky tests (run but don't block pipeline)
- Never skip or ignore tests without a tracking issue
- Re-enable quarantined tests after fixing root cause

### Test Stability Patterns
- Use retry mechanisms for inherently flaky operations (network, browser rendering)
- Set explicit timeouts for async operations (don't rely on defaults)
- Avoid `sleep` or `setTimeout` in tests — use event-driven waits
- Run tests in parallel with proper isolation (no shared ports, files, or database rows)

## Performance Testing Awareness

### Load Testing
- Simulate expected peak traffic with tools (k6, Artillery, JMeter)
- Test critical API endpoints under load: login, search, list, create
- Define acceptable response times under load (p95 < 500ms at 100 RPS)
- Run load tests in CI/staging, not production

### Stress Testing
- Push beyond expected load to find breaking points
- Identify what fails first: CPU, memory, database connections, external APIs
- Verify graceful degradation under extreme load (circuit breakers, queue backpressure)

### Soak Testing
- Run sustained load over hours to detect memory leaks and resource exhaustion
- Monitor memory usage, connection counts, and response times over time
- Identify slow growth that indicates resource leaks

## CI/CD Integration

### Test Pipeline
1. Lint and type check (fastest, catches obvious errors)
2. Unit tests (fast, broad coverage)
3. Integration tests (slower, tests real integrations)
4. E2E tests (slowest, tests critical flows)

### Coverage
- Target: 80%+ line coverage for business logic
- Don't chase 100% — diminishing returns after 85%
- Focus coverage on complex logic, not boilerplate
- Use coverage reports to find untested code paths, not as a metric to game
