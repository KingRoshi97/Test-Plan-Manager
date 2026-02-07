# Business Entity Logic Specification (BELS) — frontend

## Overview
**Domain Slug:** frontend
**Focus:** client-side UI, components, and user interactions
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| UI_001 | Application form must validate inputs before submission | When user submits application form | Validate all required fields, show inline errors | RPBS > Frontend > Application Form |
| UI_002 | User form must validate inputs before submission | When user submits user form | Validate all required fields, show inline errors | RPBS > Frontend > User Form |
| UI_003 | Platform targets form must validate inputs before submission | When user submits platform targets form | Validate all required fields, show inline errors | RPBS > Frontend > Platform targets Form |

## State Machines (Candidates)

### Entity: ApplicationView
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Initial | LOAD | Loading | UI_LOAD_ERROR | RPBS > frontend |
| Loading | RENDER | Rendered | UI_RENDER_ERROR | RPBS > frontend |
| Rendered | INTERACT | Interactive | UI_INTERACTION_ERROR | RPBS > frontend |
| Interactive | SUBMIT | Submitting | UI_SUBMIT_ERROR | RPBS > frontend |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_title | Title must be between 1 and 200 characters | UI_INVALID_APPLICATION_TITLE | RPBS > frontend |
| user_title | Title must be between 1 and 200 characters | UI_INVALID_USER_TITLE | RPBS > frontend |
| platform targets_title | Title must be between 1 and 200 characters | UI_INVALID_PLATFORM TARGETS_TITLE | RPBS > frontend |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| UI_LOAD_ERROR | LOAD denied: transition from Initial not allowed | ERROR |
| UI_RENDER_ERROR | RENDER denied: transition from Loading not allowed | ERROR |
| UI_INTERACTION_ERROR | INTERACT denied: transition from Rendered not allowed | ERROR |
| UI_SUBMIT_ERROR | SUBMIT denied: transition from Interactive not allowed | ERROR |
| UI_INVALID_APPLICATION_TITLE | Validation failed: title must be between 1 and 200 characters | WARN |
| UI_INVALID_USER_TITLE | Validation failed: title must be between 1 and 200 characters | WARN |
| UI_INVALID_PLATFORM TARGETS_TITLE | Validation failed: title must be between 1 and 200 characters | WARN |

## Open Questions
- Specific frontend domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
