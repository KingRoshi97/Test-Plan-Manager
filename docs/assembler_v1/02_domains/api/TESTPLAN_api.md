# Test Plan — API

## Overview
**Domain Slug:** api

## Test Categories

### Unit Tests
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Validate idea | Idea min 10 chars | Reject short ideas |
| Run creation | Create run with valid idea | Run ID returned |
| Status check | Get status of existing run | Status object returned |

### Integration Tests
| Test Case | Description | Dependencies | Expected Result |
|-----------|-------------|--------------|-----------------|
| Pipeline execution | Execute gen/seed/draft/package | Assembler scripts | All steps complete |
| Bundle creation | Package run into zip | infra domain | Zip file created |
| File serving | Serve zip for download | infra domain | Zip stream returned |

### E2E Tests
| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Full pipeline | Create run, execute, download | Zip file with manifest |
| Error handling | Create run with invalid idea | 400 error response |
| Not found | Get status of non-existent run | 404 error response |

## Acceptance Scenarios
<!-- Minimum scenarios that must pass -->

| Scenario ID | Description | Priority |
|-------------|-------------|----------|
| ACC_001 | POST /api/runs creates run | P0 |
| ACC_002 | POST /api/runs/:id/execute runs pipeline | P0 |
| ACC_003 | GET /api/runs/:id returns status | P0 |
| ACC_004 | GET /api/runs/:id/download serves zip | P0 |

## Edge Cases
- Empty idea → 400 Bad Request
- Idea too short (<10 chars) → 400 Bad Request
- Non-existent run ID → 404 Not Found
- Execute on already-completed run → Idempotent or 409 Conflict
- Download before pipeline complete → 404 or 202 Accepted

## Open Questions
- None - API test plan is defined for MVP
