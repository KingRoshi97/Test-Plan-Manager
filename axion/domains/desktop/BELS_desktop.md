# Business Entity Logic Specification (BELS) — desktop

## Overview
**Domain Slug:** desktop
**Focus:** desktop application patterns and native interactions
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| DSK_001 | Application views must support keyboard navigation | When user navigates application with keyboard | Ensure all interactive elements are keyboard accessible | RPBS > Desktop > Application Accessibility |
| DSK_002 | User views must support keyboard navigation | When user navigates user with keyboard | Ensure all interactive elements are keyboard accessible | RPBS > Desktop > User Accessibility |
| DSK_003 | Platform targets views must support keyboard navigation | When user navigates platform targets with keyboard | Ensure all interactive elements are keyboard accessible | RPBS > Desktop > Platform targets Accessibility |

## State Machines (Candidates)

### Entity: ApplicationWindow
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Minimized | RESTORE | Windowed | DSK_RESTORE_ERROR | RPBS > desktop |
| Windowed | MAXIMIZE | Maximized | DSK_MAXIMIZE_ERROR | RPBS > desktop |
| Maximized | RESTORE | Windowed | DSK_RESTORE_ERROR | RPBS > desktop |
| Windowed | MINIMIZE | Minimized | DSK_MINIMIZE_ERROR | RPBS > desktop |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_window | Window dimensions must be within screen bounds | DSK_BOUNDS_APPLICATION_INVALID | RPBS > desktop |
| user_window | Window dimensions must be within screen bounds | DSK_BOUNDS_USER_INVALID | RPBS > desktop |
| platform targets_window | Window dimensions must be within screen bounds | DSK_BOUNDS_PLATFORM TARGETS_INVALID | RPBS > desktop |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| DSK_RESTORE_ERROR | RESTORE denied: transition from Minimized not allowed | ERROR |
| DSK_MAXIMIZE_ERROR | MAXIMIZE denied: transition from Windowed not allowed | ERROR |
| DSK_RESTORE_ERROR | RESTORE denied: transition from Maximized not allowed | ERROR |
| DSK_MINIMIZE_ERROR | MINIMIZE denied: transition from Windowed not allowed | ERROR |
| DSK_BOUNDS_APPLICATION_INVALID | Validation failed: window dimensions must be within screen bounds | WARN |
| DSK_BOUNDS_USER_INVALID | Validation failed: window dimensions must be within screen bounds | WARN |
| DSK_BOUNDS_PLATFORM TARGETS_INVALID | Validation failed: window dimensions must be within screen bounds | WARN |

## Open Questions
- Specific desktop domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
