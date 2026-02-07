# Business Entity Logic Specification (BELS) — auth

## Overview
**Domain Slug:** auth
**Focus:** authentication, authorization, and identity
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| AUTH_001 | User must provide valid credentials to authenticate | When login attempt is made | Verify credentials against stored hash | RPBS > Auth > Login |
| AUTH_002 | Session tokens must expire after configured duration | When session age exceeds limit | Invalidate session and require re-authentication | RPBS > Auth > Sessions |
| AUTH_003 | Protected resources require valid authentication | When unauthenticated request hits protected endpoint | Return 401 Unauthorized | RPBS > Auth > Access Control |

## State Machines (Candidates)

### Entity: UserSession
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Anonymous | LOGIN | Authenticated | AUTH_LOGIN_FAILED | RPBS > auth |
| Authenticated | REFRESH | Authenticated | AUTH_REFRESH_FAILED | RPBS > auth |
| Authenticated | LOGOUT | Anonymous | AUTH_LOGOUT_ERROR | RPBS > auth |
| Authenticated | EXPIRE | Expired | AUTH_SESSION_EXPIRED | RPBS > auth |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| email | Must be valid email format | AUTH_INVALID_EMAIL | RPBS > auth |
| password | Must meet minimum complexity requirements | AUTH_WEAK_PASSWORD | RPBS > auth |
| token | Must be valid JWT format | AUTH_INVALID_TOKEN | RPBS > auth |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| AUTH_LOGIN_FAILED | LOGIN denied: transition from Anonymous not allowed | ERROR |
| AUTH_REFRESH_FAILED | REFRESH denied: transition from Authenticated not allowed | ERROR |
| AUTH_LOGOUT_ERROR | LOGOUT denied: transition from Authenticated not allowed | ERROR |
| AUTH_SESSION_EXPIRED | EXPIRE denied: transition from Authenticated not allowed | ERROR |
| AUTH_INVALID_EMAIL | Validation failed: must be valid email format | WARN |
| AUTH_WEAK_PASSWORD | Validation failed: must meet minimum complexity requirements | WARN |
| AUTH_INVALID_TOKEN | Validation failed: must be valid jwt format | WARN |

## Open Questions
- Specific auth domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
