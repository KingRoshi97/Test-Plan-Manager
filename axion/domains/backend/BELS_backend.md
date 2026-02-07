# Business Entity Logic Specification (BELS) — backend

## Overview
**Domain Slug:** backend
**Focus:** server-side logic, APIs, and business rules
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| BE_001 | Application operations must be wrapped in error handling | When application business logic executes | Catch errors, log context, return appropriate error response | RPBS > Backend > Application Logic |
| BE_002 | User operations must be wrapped in error handling | When user business logic executes | Catch errors, log context, return appropriate error response | RPBS > Backend > User Logic |
| BE_003 | Platform targets operations must be wrapped in error handling | When platform targets business logic executes | Catch errors, log context, return appropriate error response | RPBS > Backend > Platform targets Logic |

## State Machines (Candidates)

### Entity: ApplicationHandler
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Received | AUTHORIZE | Authorized | BE_UNAUTHORIZED | RPBS > backend |
| Authorized | EXECUTE | Executing | BE_EXECUTION_ERROR | RPBS > backend |
| Executing | COMPLETE | Completed | BE_COMPLETION_ERROR | RPBS > backend |
| Executing | FAIL | Failed | BE_OPERATION_FAILED | RPBS > backend |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_payload | Request payload must contain all required fields | BE_MISSING_APPLICATION_FIELDS | RPBS > backend |
| user_payload | Request payload must contain all required fields | BE_MISSING_USER_FIELDS | RPBS > backend |
| platform targets_payload | Request payload must contain all required fields | BE_MISSING_PLATFORM TARGETS_FIELDS | RPBS > backend |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| BE_UNAUTHORIZED | AUTHORIZE denied: transition from Received not allowed | ERROR |
| BE_EXECUTION_ERROR | EXECUTE denied: transition from Authorized not allowed | ERROR |
| BE_COMPLETION_ERROR | COMPLETE denied: transition from Executing not allowed | ERROR |
| BE_OPERATION_FAILED | FAIL denied: transition from Executing not allowed | ERROR |
| BE_MISSING_APPLICATION_FIELDS | Validation failed: request payload must contain all required fields | WARN |
| BE_MISSING_USER_FIELDS | Validation failed: request payload must contain all required fields | WARN |
| BE_MISSING_PLATFORM TARGETS_FIELDS | Validation failed: request payload must contain all required fields | WARN |

## Open Questions
- Specific backend domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
