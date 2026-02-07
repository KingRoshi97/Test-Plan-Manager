# Execution Readiness Contract (ERC) — frontend v1

## Overview
**Module:** frontend
**Version:** v1
**Lock Date:** 2026-02-07T17:04:34.103Z
**Content Hash:** 4e1d6a9b0b83d4bf

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — frontend

## Overview
**Domain Slug:** frontend
**Focus:** client-side UI, components, and user interactions
**Status:** DRAFT - Truth Candidates
**Project:** nw-app-test

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| UI_001 | User form must validate inputs before submission | When user submits user form | Validate all required fields, show inline errors | RPBS > Frontend > User Form |
| UI_002 | Platform targets form must validate inputs before submission | When user submits platform targets form | Validate all required fields, show inline errors | RPBS > Frontend > Platform targets Form |
| UI_003 | Integrations complexity form must validate inputs before submission | When user submits integrations complexity form | Validate all required fields, show inline errors | RPBS > Frontend > Integrations complexity Form |

## State Machines (Candidates)

### Entity: UserView
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Initial | LOAD | Loading | UI_LOAD_ERROR | RPBS > frontend |
| Loading | RENDER | Rendered | UI_RENDER_ERROR | RPBS > frontend |
| Rendered | INTERACT | Interactive | UI_INTERACTION_ERROR | RPBS > frontend |
| Interactive | SUBMIT | Submitting | UI_SUBMIT_ERROR | RPBS > frontend |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| user_title | Title must be between 1 and 200 characters | UI_INVALID_USER_TITLE | RPBS > frontend |
| platform targets_title | Title must be between 1 and 200 characters | UI_INVALID_PLATFORM TARGETS_TITLE | RPBS > frontend |
| integrations complexity_title | Title must be between 1 and 200 characters | UI_INVALID_INTEGRATIONS COMPLEXITY_TITLE | RPBS > frontend |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| UI_LOAD_ERROR | LOAD denied: transition from Initial not allowed | ERROR |
| UI_RENDER_ERROR | RENDER denied: transition from Loading not allowed | ERROR |
| UI_INTERACTION_ERROR | INTERACT denied: transition from Rendered not allowed | ERROR |
| UI_SUBMIT_ERROR | SUBMIT denied: transition from Interactive not allowed | ERROR |
| UI_INVALID_USER_TITLE | Validation failed: title must be between 1 and 200 characters | WARN |
| UI_INVALID_PLATFORM TARGETS_TITLE | Validation failed: title must be between 1 and 200 characters | WARN |
| UI_INVALID_INTEGRATIONS COMPLEXITY_TITLE | Validation failed: title must be between 1 and 200 characters | WARN |

## Open Questions
- Specific frontend domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** axion:lock script
- **Lock date:** 2026-02-07T17:04:34.103Z
- **Hash:** 4e1d6a9b0b83d4bf
