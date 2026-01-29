# Test Plan — Web

## Overview
**Domain Slug:** web

## Test Categories

### Unit Tests
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| IdeaForm validation | Form rejects empty idea | Error message shown |
| IdeaForm validation | Form accepts valid idea (10+ chars) | Submit enabled |
| RunStatusDisplay | Shows correct step indicator | Step name displayed |

### Integration Tests
| Test Case | Description | Dependencies | Expected Result |
|-----------|-------------|--------------|-----------------|
| Submit idea | POST to /api/runs | API domain | Run created, ID returned |
| Execute pipeline | POST to /api/runs/:id/execute | API domain | Pipeline starts |
| Poll status | GET /api/runs/:id | API domain | Status returned |
| Download bundle | GET /api/runs/:id/download | API domain | Zip file downloaded |

### E2E Tests
| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Full flow | Enter idea, generate, wait, download | Bundle zip saved to disk |
| Copy prompt | Enter idea, generate, copy prompt | Prompt in clipboard |
| Error handling | Submit empty idea | Error message displayed |

## Acceptance Scenarios
<!-- Minimum scenarios that must pass -->

| Scenario ID | Description | Priority |
|-------------|-------------|----------|
| ACC_001 | User can submit idea and receive bundle | P0 |
| ACC_002 | User can download bundle zip | P0 |
| ACC_003 | User can copy agent prompt | P1 |

## Edge Cases
- Empty idea field → show validation error
- Very long idea (>10000 chars) → truncate or reject
- Network error during pipeline → show error, allow retry
- Pipeline fails → show error message with details

## Open Questions
- None - test plan is defined for MVP
