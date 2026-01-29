# Test Plan — Infrastructure

## Overview
**Domain Slug:** infra

## Test Categories

### Unit Tests
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| File read | Read existing file | Contents returned |
| File read missing | Read non-existent file | Error thrown |
| File write | Write to new path | File created |
| File write no-overwrite | Write to existing path | Skip or error |
| Directory create | Create nested dirs | Dirs created |

### Integration Tests
| Test Case | Description | Dependencies | Expected Result |
|-----------|-------------|--------------|-----------------|
| Zip creation | Create zip with files | archiver | Valid zip file |
| Zip contents | Zip contains expected files | archiver | All files present |
| Path resolution | Resolve relative paths | Node.js path | Correct absolute paths |

### E2E Tests
| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| Bundle creation | Add files, finalize, verify | Valid downloadable zip |

## Acceptance Scenarios
<!-- Minimum scenarios that must pass -->

| Scenario ID | Description | Priority |
|-------------|-------------|----------|
| ACC_001 | Files can be read and written | P0 |
| ACC_002 | Zip archives can be created | P0 |
| ACC_003 | No-overwrite rule is enforced | P0 |

## Edge Cases
- Write to non-existent parent dir → create parent dirs
- Read from non-existent file → throw error
- Zip with empty content → valid empty zip
- Path traversal attempt → reject

## Open Questions
- None - infra test plan is defined for MVP
