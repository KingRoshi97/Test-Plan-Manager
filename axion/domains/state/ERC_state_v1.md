# Execution Readiness Contract (ERC) — state v1

## Overview
**Module:** state
**Version:** v1
**Lock Date:** 2026-02-07T17:04:34.032Z
**Content Hash:** 7614557defe582cd

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — state

## Overview
**Domain Slug:** state
**Focus:** application state management and data flow
**Status:** DRAFT - Truth Candidates
**Project:** nw-app-test

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| STATE_001 | User state changes must be dispatched through actions | When user data needs to be updated | Dispatch action with payload, update store immutably | RPBS > State > User Store |
| STATE_002 | Platform targets state changes must be dispatched through actions | When platform targets data needs to be updated | Dispatch action with payload, update store immutably | RPBS > State > Platform targets Store |
| STATE_003 | Integrations complexity state changes must be dispatched through actions | When integrations complexity data needs to be updated | Dispatch action with payload, update store immutably | RPBS > State > Integrations complexity Store |

## State Machines (Candidates)

### Entity: UserState
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Idle | FETCH | Loading | STATE_FETCH_ERROR | RPBS > state |
| Loading | SUCCESS | Loaded | STATE_LOAD_ERROR | RPBS > state |
| Loading | FAILURE | Error | STATE_LOAD_FAILED | RPBS > state |
| Loaded | INVALIDATE | Stale | STATE_INVALIDATION_ERROR | RPBS > state |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| user_state | State shape must conform to defined interface | STATE_SHAPE_USER_INVALID | RPBS > state |
| platform targets_state | State shape must conform to defined interface | STATE_SHAPE_PLATFORM TARGETS_INVALID | RPBS > state |
| integrations complexity_state | State shape must conform to defined interface | STATE_SHAPE_INTEGRATIONS COMPLEXITY_INVALID | RPBS > state |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| STATE_FETCH_ERROR | FETCH denied: transition from Idle not allowed | ERROR |
| STATE_LOAD_ERROR | SUCCESS denied: transition from Loading not allowed | ERROR |
| STATE_LOAD_FAILED | FAILURE denied: transition from Loading not allowed | ERROR |
| STATE_INVALIDATION_ERROR | INVALIDATE denied: transition from Loaded not allowed | ERROR |
| STATE_SHAPE_USER_INVALID | Validation failed: state shape must conform to defined interface | WARN |
| STATE_SHAPE_PLATFORM TARGETS_INVALID | Validation failed: state shape must conform to defined interface | WARN |
| STATE_SHAPE_INTEGRATIONS COMPLEXITY_INVALID | Validation failed: state shape must conform to defined interface | WARN |

## Open Questions
- Specific state domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** axion:lock script
- **Lock date:** 2026-02-07T17:04:34.032Z
- **Hash:** 7614557defe582cd
