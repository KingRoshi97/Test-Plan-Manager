# Business Entity Logic Specification (BELS) — systems

## Overview
**Domain Slug:** systems
**Focus:** system components, services, and interactions
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| SYS_001 | Application service must handle concurrent requests safely | When multiple application operations arrive simultaneously | Apply request queuing and isolation | RPBS > Systems > Concurrency |
| SYS_002 | User service must handle concurrent requests safely | When multiple user operations arrive simultaneously | Apply request queuing and isolation | RPBS > Systems > Concurrency |
| SYS_003 | Platform targets service must handle concurrent requests safely | When multiple platform targets operations arrive simultaneously | Apply request queuing and isolation | RPBS > Systems > Concurrency |

## State Machines (Candidates)

### Entity: ApplicationService
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Stopped | START | Running | SYS_START_FAILED | RPBS > systems |
| Running | HEALTH_CHECK | Running | SYS_UNHEALTHY | RPBS > systems |
| Running | STOP | Stopped | SYS_STOP_FAILED | RPBS > systems |
| Running | OVERLOAD | Degraded | SYS_OVERLOADED | RPBS > systems |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_service_config | Service endpoint must be valid URL | SYS_INVALID_APPLICATION_ENDPOINT | RPBS > systems |
| user_service_config | Service endpoint must be valid URL | SYS_INVALID_USER_ENDPOINT | RPBS > systems |
| platform targets_service_config | Service endpoint must be valid URL | SYS_INVALID_PLATFORM TARGETS_ENDPOINT | RPBS > systems |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| SYS_START_FAILED | START denied: transition from Stopped not allowed | ERROR |
| SYS_UNHEALTHY | HEALTH_CHECK denied: transition from Running not allowed | ERROR |
| SYS_STOP_FAILED | STOP denied: transition from Running not allowed | ERROR |
| SYS_OVERLOADED | OVERLOAD denied: transition from Running not allowed | ERROR |
| SYS_INVALID_APPLICATION_ENDPOINT | Validation failed: service endpoint must be valid url | WARN |
| SYS_INVALID_USER_ENDPOINT | Validation failed: service endpoint must be valid url | WARN |
| SYS_INVALID_PLATFORM TARGETS_ENDPOINT | Validation failed: service endpoint must be valid url | WARN |

## Open Questions
- Specific systems domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
