# Business Entity Logic Specification (BELS) — data

## Overview
**Domain Slug:** data
**Focus:** data flows, transformations, and validation
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| DATA_001 | Application data must be sanitized before storage | When application data enters the system | Apply sanitization and type coercion rules | RPBS > Data > Application Validation |
| DATA_002 | User data must be sanitized before storage | When user data enters the system | Apply sanitization and type coercion rules | RPBS > Data > User Validation |
| DATA_003 | Platform targets data must be sanitized before storage | When platform targets data enters the system | Apply sanitization and type coercion rules | RPBS > Data > Platform targets Validation |

## State Machines (Candidates)

### Entity: ApplicationPipeline
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Raw | VALIDATE | Validated | DATA_INVALID | RPBS > data |
| Validated | TRANSFORM | Transformed | DATA_TRANSFORM_ERROR | RPBS > data |
| Transformed | PERSIST | Stored | DATA_PERSIST_ERROR | RPBS > data |
| Raw | REJECT | Rejected | DATA_REJECTED | RPBS > data |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_input | Input must match expected data type and format | DATA_TYPE_APPLICATION_MISMATCH | RPBS > data |
| user_input | Input must match expected data type and format | DATA_TYPE_USER_MISMATCH | RPBS > data |
| platform targets_input | Input must match expected data type and format | DATA_TYPE_PLATFORM TARGETS_MISMATCH | RPBS > data |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| DATA_INVALID | VALIDATE denied: transition from Raw not allowed | ERROR |
| DATA_TRANSFORM_ERROR | TRANSFORM denied: transition from Validated not allowed | ERROR |
| DATA_PERSIST_ERROR | PERSIST denied: transition from Transformed not allowed | ERROR |
| DATA_REJECTED | REJECT denied: transition from Raw not allowed | ERROR |
| DATA_TYPE_APPLICATION_MISMATCH | Validation failed: input must match expected data type and format | WARN |
| DATA_TYPE_USER_MISMATCH | Validation failed: input must match expected data type and format | WARN |
| DATA_TYPE_PLATFORM TARGETS_MISMATCH | Validation failed: input must match expected data type and format | WARN |

## Open Questions
- Specific data domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
