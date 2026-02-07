# Execution Readiness Contract (ERC) — contracts v1

## Overview
**Module:** contracts
**Version:** v1
**Lock Date:** 2026-02-07T17:04:33.974Z
**Content Hash:** 35bf8075c009b80c

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — contracts

## Overview
**Domain Slug:** contracts
**Focus:** API contracts, interfaces, and data schemas
**Status:** DRAFT - Truth Candidates
**Project:** nw-app-test

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| API_001 | User API must validate request body against schema | When user create/update request is received | Validate against User schema, reject with 400 if invalid | RPBS > Contracts > User Schema |
| API_002 | Platform targets API must validate request body against schema | When platform targets create/update request is received | Validate against Platform targets schema, reject with 400 if invalid | RPBS > Contracts > Platform targets Schema |
| API_003 | Integrations complexity API must validate request body against schema | When integrations complexity create/update request is received | Validate against Integrations complexity schema, reject with 400 if invalid | RPBS > Contracts > Integrations complexity Schema |

## State Machines (Candidates)

### Entity: UserRequest
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Received | VALIDATE | Validated | API_VALIDATION_FAILED | RPBS > contracts |
| Validated | PROCESS | Processing | API_PROCESSING_ERROR | RPBS > contracts |
| Processing | RESPOND | Completed | API_RESPONSE_ERROR | RPBS > contracts |
| Received | REJECT | Rejected | API_REJECTED | RPBS > contracts |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| user_id | Must be valid identifier format | API_INVALID_USER_ID | RPBS > contracts |
| platform targets_id | Must be valid identifier format | API_INVALID_PLATFORM TARGETS_ID | RPBS > contracts |
| integrations complexity_id | Must be valid identifier format | API_INVALID_INTEGRATIONS COMPLEXITY_ID | RPBS > contracts |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| API_VALIDATION_FAILED | VALIDATE denied: transition from Received not allowed | ERROR |
| API_PROCESSING_ERROR | PROCESS denied: transition from Validated not allowed | ERROR |
| API_RESPONSE_ERROR | RESPOND denied: transition from Processing not allowed | ERROR |
| API_REJECTED | REJECT denied: transition from Received not allowed | ERROR |
| API_INVALID_USER_ID | Validation failed: must be valid identifier format | WARN |
| API_INVALID_PLATFORM TARGETS_ID | Validation failed: must be valid identifier format | WARN |
| API_INVALID_INTEGRATIONS COMPLEXITY_ID | Validation failed: must be valid identifier format | WARN |

## Open Questions
- Specific contracts domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** axion:lock script
- **Lock date:** 2026-02-07T17:04:33.974Z
- **Hash:** 35bf8075c009b80c
