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

### E2E Tests (10% of test suite)
- Test critical user journeys through the real UI
- Use Playwright (recommended) or Cypress
- Keep E2E tests minimal — test happy paths and critical flows
- Run in CI but don't block deploys for flaky E2E tests (quarantine them)

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

### Testing Library Best Practices
- Query by role, label, or text first (matches how users find elements)
- Avoid querying by CSS class or tag name
- Use `userEvent` over `fireEvent` (simulates real user behavior)
- Wait for async operations with `waitFor` or `findBy` queries
- Don't test implementation details (state values, component instances)

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

## Test Data

### Factories
- Use factory functions to create test data with sensible defaults
- Override only the fields relevant to each test
- Never hardcode IDs or timestamps in assertions (use matchers)

### Database Test Data
- Create fresh data for each test (don't rely on seed data)
- Clean up after tests (use transactions that rollback, or truncate)
- Use realistic data shapes (not `{ name: 'test' }`)

## CI/CD Integration

### Test Pipeline
1. Lint and type check (fastest, catches obvious errors)
2. Unit tests (fast, broad coverage)
3. Integration tests (slower, tests real integrations)
4. E2E tests (slowest, tests critical flows)

### Flaky Test Policy
- Track flaky tests and fix within one sprint
- Quarantine flaky tests (run but don't block pipeline)
- Never skip or ignore tests without a tracking issue
- Re-enable quarantined tests after fixing root cause

### Coverage
- Target: 80%+ line coverage for business logic
- Don't chase 100% — diminishing returns after 85%
- Focus coverage on complex logic, not boilerplate
- Use coverage reports to find untested code paths, not as a metric to game
