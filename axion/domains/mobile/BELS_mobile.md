# Business Entity Logic Specification (BELS) — mobile

## Overview
**Domain Slug:** mobile
**Focus:** mobile-specific patterns and responsive behavior
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| MOB_001 | Application views must be responsive and touch-friendly | When application is displayed on mobile viewport | Apply mobile layout with appropriate touch targets | RPBS > Mobile > Application Layout |
| MOB_002 | User views must be responsive and touch-friendly | When user is displayed on mobile viewport | Apply mobile layout with appropriate touch targets | RPBS > Mobile > User Layout |
| MOB_003 | Platform targets views must be responsive and touch-friendly | When platform targets is displayed on mobile viewport | Apply mobile layout with appropriate touch targets | RPBS > Mobile > Platform targets Layout |

## State Machines (Candidates)

### Entity: ApplicationView
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Portrait | ROTATE | Landscape | MOB_ROTATION_ERROR | RPBS > mobile |
| Landscape | ROTATE | Portrait | MOB_ROTATION_ERROR | RPBS > mobile |
| Online | DISCONNECT | Offline | MOB_OFFLINE_ERROR | RPBS > mobile |
| Offline | RECONNECT | Online | MOB_SYNC_ERROR | RPBS > mobile |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_input | Touch input must have minimum 44px target area | MOB_TOUCH_APPLICATION_TOO_SMALL | RPBS > mobile |
| user_input | Touch input must have minimum 44px target area | MOB_TOUCH_USER_TOO_SMALL | RPBS > mobile |
| platform targets_input | Touch input must have minimum 44px target area | MOB_TOUCH_PLATFORM TARGETS_TOO_SMALL | RPBS > mobile |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| MOB_ROTATION_ERROR | ROTATE denied: transition from Portrait not allowed | ERROR |
| MOB_ROTATION_ERROR | ROTATE denied: transition from Landscape not allowed | ERROR |
| MOB_OFFLINE_ERROR | DISCONNECT denied: transition from Online not allowed | ERROR |
| MOB_SYNC_ERROR | RECONNECT denied: transition from Offline not allowed | ERROR |
| MOB_TOUCH_APPLICATION_TOO_SMALL | Validation failed: touch input must have minimum 44px target area | WARN |
| MOB_TOUCH_USER_TOO_SMALL | Validation failed: touch input must have minimum 44px target area | WARN |
| MOB_TOUCH_PLATFORM TARGETS_TOO_SMALL | Validation failed: touch input must have minimum 44px target area | WARN |

## Open Questions
- Specific mobile domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
