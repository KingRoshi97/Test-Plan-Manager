# Reason Codes

## Overview
This document defines all reason codes used for errors, warnings, and informational messages.

## Code Format
Format: `{DOMAIN}_{CATEGORY}_{CODE}`

## Reason Codes

### Platform Domain

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| PLATFORM_AUTH_001 | User not authenticated | ERROR | User must be authenticated |
| PLATFORM_AUTH_002 | Session expired | ERROR | User session has expired |
| PLATFORM_USER_001 | User not found | ERROR | Requested user does not exist |
| PLATFORM_PROJECT_001 | Project not found | ERROR | Requested project does not exist |

### API Domain

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| API_RUN_001 | Run not found | ERROR | Requested run does not exist |
| API_RUN_002 | Run in progress | INFO | Run is currently executing |
| API_RUN_003 | Run failed | ERROR | Run execution failed |
| API_VERIFY_001 | Verification failed | ERROR | Domain verification failed |
| API_LOCK_001 | Cannot lock - UNKNOWNs exist | ERROR | Domain has unresolved UNKNOWNs |
| API_BUNDLE_001 | Bundle generation failed | ERROR | Failed to generate bundle |

### Security Domain

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| SECURITY_ACCESS_001 | Access denied | ERROR | User lacks required permissions |
| SECURITY_TOKEN_001 | Invalid token | ERROR | Authentication token is invalid |

## Open Questions
- UNKNOWN
