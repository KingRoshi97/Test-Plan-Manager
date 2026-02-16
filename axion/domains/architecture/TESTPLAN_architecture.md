# Test Plan — architecture

## Overview
**Domain Slug:** architecture
**Prefix:** arch
**Project:** Application

---

## Test Strategy

### Testing Priorities
- **P0 (Critical):** Core architecture CRUD operations, authentication gates, data validation
- **P1 (Important):** Edge cases, error handling, cross-module interactions
- **P2 (Nice-to-have):** Performance benchmarks, accessibility audits, visual regression

### Test Types in Scope
| Type | In Scope? | Tool/Framework | Coverage Target |
|------|----------|---------------|----------------|
| Unit | Yes | Vitest | 80% of business logic |
| Integration | Yes | Vitest + supertest | Key API flows |
| E2E | Yes | Playwright | Critical user journeys |
| Contract | Yes | Vitest | All DIM interfaces |
| Performance | Yes | Lighthouse / custom | P1 targets |
| Accessibility | Yes | axe-core | WCAG 2.1 AA |

---

## Acceptance Scenarios

| Scenario ID | Description | Given | When | Then | Priority | Source |
|------------|-------------|-------|------|------|----------|--------|
| arch_TEST_001 | Application creation happy path | User on /applications/new | Fills all required fields and submits | Application created, redirected to detail page, success toast shown | P0 | RPBS §5 |
| arch_TEST_002 | User creation happy path | User on /users/new | Fills all required fields and submits | User created, redirected to detail page, success toast shown | P0 | RPBS §5 |
| arch_TEST_003 | Platform targets creation happy path | User on /platform targetss/new | Fills all required fields and submits | Platform targets created, redirected to detail page, success toast shown | P0 | RPBS §5 |

---

## Business Rule Tests

| Test ID | Rule Ref | Type | Description | Input/Setup | Expected Result | Priority |
|---------|---------|------|-------------|-------------|----------------|----------|
| arch_TEST_101 | arch_RULE_001 | unit | Application validation enforced | Invalid application data submitted | Validation error returned with correct error code | P0 |
| arch_TEST_102 | arch_RULE_002 | unit | User validation enforced | Invalid user data submitted | Validation error returned with correct error code | P0 |

---

## Edge Cases

| Edge Case ID | Description | Expected Behavior | Risk Level |
|-------------|-------------|-------------------|-----------|
| arch_EDGE_001 | Empty application list renders empty state correctly | Empty state illustration and CTA displayed | Medium |
| arch_EDGE_002 | Empty user list renders empty state correctly | Empty state illustration and CTA displayed | Medium |

---

## Error Scenarios

| Error ID | Trigger | Expected Error Code | User-Facing Message | Recovery | Source |
|---------|---------|-------------------|-------------------|----------|--------|
| arch_ERR_001 | Invalid application data submitted | VALIDATION_APPLICATION_INVALID | Please check your application details | Highlight invalid fields | BELS |
| arch_ERR_002 | Invalid user data submitted | VALIDATION_USER_INVALID | Please check your user details | Highlight invalid fields | BELS |

---

## API Contract Tests

| Test ID | Endpoint | Method | Input | Expected Status | Expected Body Shape | Priority |
|---------|---------|--------|-------|----------------|--------------------|---------| 
| arch_TEST_201 | /api/applications | GET | ?page=1&limit=10 | 200 | { items: Application[], total: number } | P0 |
| arch_TEST_202 | /api/users | GET | ?page=1&limit=10 | 200 | { items: User[], total: number } | P0 |

---

## Performance Criteria

| Metric | Target | Measurement Method | Priority |
|--------|--------|-------------------|----------|
| API response time (p95) | < 200ms | Load test with k6 | P1 |
| Page load (FCP) | < 1.5s | Lighthouse CI | P1 |
| Bundle size (initial) | < 200KB | Bundler analysis | P2 |

---

## Test Data Requirements

| Fixture | Description | Fields | Notes |
|---------|-------------|--------|-------|
| testApplication | Sample application for testing | id, name, status, createdAt | Auto-generated per test run |
| testUser | Sample user for testing | id, name, status, createdAt | Auto-generated per test run |
| testPlatform targets | Sample platform targets for testing | id, name, status, createdAt | Auto-generated per test run |

### Test Environment
- Database: Test database (isolated from production)
- External services: Mocked where possible
- Auth: Test tokens with configurable roles

---

## Coverage Goals

| Area | Target Coverage | Notes |
|------|----------------|-------|
| Unit tests | 80% | Business logic and validators |
| Integration tests | 70% | API routes and data flows |
| E2E tests | Critical paths | All P0 user journeys |

---

## Open Questions
- Exact performance targets need RPBS §7 non-functional profile
- Test data seeding strategy needs finalization
