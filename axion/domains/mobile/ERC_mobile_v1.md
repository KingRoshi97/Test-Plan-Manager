# Execution Readiness Contract (ERC) — mobile v1

## Overview
**Module:** mobile
**Version:** v1
**Lock Date:** 2026-02-07T17:04:34.154Z
**Content Hash:** 2f6007a52b14ba3c

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — mobile

## Overview
**Domain Slug:** mobile
**Focus:** mobile-specific patterns and responsive behavior
**Status:** DRAFT - Truth Candidates
**Project:** nw-app-test

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| MOB_001 | User views must be responsive and touch-friendly | When user is displayed on mobile viewport | Apply mobile layout with appropriate touch targets | RPBS > Mobile > User Layout |
| MOB_002 | Platform targets views must be responsive and touch-friendly | When platform targets is displayed on mobile viewport | Apply mobile layout with appropriate touch targets | RPBS > Mobile > Platform targets Layout |
| MOB_003 | Integrations complexity views must be responsive and touch-friendly | When integrations complexity is displayed on mobile viewport | Apply mobile layout with appropriate touch targets | RPBS > Mobile > Integrations complexity Layout |

## State Machines (Candidates)

### Entity: UserView
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Portrait | ROTATE | Landscape | MOB_ROTATION_ERROR | RPBS > mobile |
| Landscape | ROTATE | Portrait | MOB_ROTATION_ERROR | RPBS > mobile |
| Online | DISCONNECT | Offline | MOB_OFFLINE_ERROR | RPBS > mobile |
| Offline | RECONNECT | Online | MOB_SYNC_ERROR | RPBS > mobile |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| user_input | Touch input must have minimum 44px target area | MOB_TOUCH_USER_TOO_SMALL | RPBS > mobile |
| platform targets_input | Touch input must have minimum 44px target area | MOB_TOUCH_PLATFORM TARGETS_TOO_SMALL | RPBS > mobile |
| integrations complexity_input | Touch input must have minimum 44px target area | MOB_TOUCH_INTEGRATIONS COMPLEXITY_TOO_SMALL | RPBS > mobile |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| MOB_ROTATION_ERROR | ROTATE denied: transition from Portrait not allowed | ERROR |
| MOB_ROTATION_ERROR | ROTATE denied: transition from Landscape not allowed | ERROR |
| MOB_OFFLINE_ERROR | DISCONNECT denied: transition from Online not allowed | ERROR |
| MOB_SYNC_ERROR | RECONNECT denied: transition from Offline not allowed | ERROR |
| MOB_TOUCH_USER_TOO_SMALL | Validation failed: touch input must have minimum 44px target area | WARN |
| MOB_TOUCH_PLATFORM TARGETS_TOO_SMALL | Validation failed: touch input must have minimum 44px target area | WARN |
| MOB_TOUCH_INTEGRATIONS COMPLEXITY_TOO_SMALL | Validation failed: touch input must have minimum 44px target area | WARN |

## Open Questions
- Specific mobile domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** axion:lock script
- **Lock date:** 2026-02-07T17:04:34.154Z
- **Hash:** 2f6007a52b14ba3c
