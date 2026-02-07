# Business Entity Logic Specification (BELS) — contracts

## Overview
**Domain Slug:** contracts
**Focus:** API contracts, interfaces, and data schemas
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| API_001 | Application API must validate request body against schema | When application create/update request is received | Validate against Application schema, reject with 400 if invalid | RPBS > Contracts > Application Schema |
| API_002 | User API must validate request body against schema | When user create/update request is received | Validate against User schema, reject with 400 if invalid | RPBS > Contracts > User Schema |
| API_003 | Platform targets API must validate request body against schema | When platform targets create/update request is received | Validate against Platform targets schema, reject with 400 if invalid | RPBS > Contracts > Platform targets Schema |

## State Machines (Candidates)

### Entity: ApplicationRequest
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Received | VALIDATE | Validated | API_VALIDATION_FAILED | RPBS > contracts |
| Validated | PROCESS | Processing | API_PROCESSING_ERROR | RPBS > contracts |
| Processing | RESPOND | Completed | API_RESPONSE_ERROR | RPBS > contracts |
| Received | REJECT | Rejected | API_REJECTED | RPBS > contracts |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_id | Must be valid identifier format | API_INVALID_APPLICATION_ID | RPBS > contracts |
| user_id | Must be valid identifier format | API_INVALID_USER_ID | RPBS > contracts |
| platform targets_id | Must be valid identifier format | API_INVALID_PLATFORM TARGETS_ID | RPBS > contracts |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| API_VALIDATION_FAILED | VALIDATE denied: transition from Received not allowed | ERROR |
| API_PROCESSING_ERROR | PROCESS denied: transition from Validated not allowed | ERROR |
| API_RESPONSE_ERROR | RESPOND denied: transition from Processing not allowed | ERROR |
| API_REJECTED | REJECT denied: transition from Received not allowed | ERROR |
| API_INVALID_APPLICATION_ID | Validation failed: must be valid identifier format | WARN |
| API_INVALID_USER_ID | Validation failed: must be valid identifier format | WARN |
| API_INVALID_PLATFORM TARGETS_ID | Validation failed: must be valid identifier format | WARN |

## Open Questions
- Specific contracts domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
