# Business Entity Logic Specification (BELS) — state

## Overview
**Domain Slug:** state
**Focus:** application state management and data flow
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| STATE_001 | Application state changes must be dispatched through actions | When application data needs to be updated | Dispatch action with payload, update store immutably | RPBS > State > Application Store |
| STATE_002 | User state changes must be dispatched through actions | When user data needs to be updated | Dispatch action with payload, update store immutably | RPBS > State > User Store |
| STATE_003 | Platform targets state changes must be dispatched through actions | When platform targets data needs to be updated | Dispatch action with payload, update store immutably | RPBS > State > Platform targets Store |

## State Machines (Candidates)

### Entity: ApplicationState
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Idle | FETCH | Loading | STATE_FETCH_ERROR | RPBS > state |
| Loading | SUCCESS | Loaded | STATE_LOAD_ERROR | RPBS > state |
| Loading | FAILURE | Error | STATE_LOAD_FAILED | RPBS > state |
| Loaded | INVALIDATE | Stale | STATE_INVALIDATION_ERROR | RPBS > state |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_state | State shape must conform to defined interface | STATE_SHAPE_APPLICATION_INVALID | RPBS > state |
| user_state | State shape must conform to defined interface | STATE_SHAPE_USER_INVALID | RPBS > state |
| platform targets_state | State shape must conform to defined interface | STATE_SHAPE_PLATFORM TARGETS_INVALID | RPBS > state |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| STATE_FETCH_ERROR | FETCH denied: transition from Idle not allowed | ERROR |
| STATE_LOAD_ERROR | SUCCESS denied: transition from Loading not allowed | ERROR |
| STATE_LOAD_FAILED | FAILURE denied: transition from Loading not allowed | ERROR |
| STATE_INVALIDATION_ERROR | INVALIDATE denied: transition from Loaded not allowed | ERROR |
| STATE_SHAPE_APPLICATION_INVALID | Validation failed: state shape must conform to defined interface | WARN |
| STATE_SHAPE_USER_INVALID | Validation failed: state shape must conform to defined interface | WARN |
| STATE_SHAPE_PLATFORM TARGETS_INVALID | Validation failed: state shape must conform to defined interface | WARN |

## Open Questions
- Specific state domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
