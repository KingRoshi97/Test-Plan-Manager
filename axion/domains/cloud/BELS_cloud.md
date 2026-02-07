# Business Entity Logic Specification (BELS) — cloud

## Overview
**Domain Slug:** cloud
**Focus:** cloud domain concerns
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| CLOU_001 | Application operations must follow cloud domain rules | When application interacts with cloud subsystem | Apply cloud-specific validation and processing | RPBS > cloud > Application Rules |
| CLOU_002 | User operations must follow cloud domain rules | When user interacts with cloud subsystem | Apply cloud-specific validation and processing | RPBS > cloud > User Rules |
| CLOU_003 | Platform targets operations must follow cloud domain rules | When platform targets interacts with cloud subsystem | Apply cloud-specific validation and processing | RPBS > cloud > Platform targets Rules |

## State Machines (Candidates)

### Entity: ApplicationProcess
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Pending | START | Active | CLOU_START_ERROR | RPBS > cloud |
| Active | COMPLETE | Done | CLOU_COMPLETE_ERROR | RPBS > cloud |
| Active | FAIL | Failed | CLOU_OPERATION_FAILED | RPBS > cloud |
| Failed | RETRY | Active | CLOU_RETRY_ERROR | RPBS > cloud |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_cloud_config | Configuration must be valid for cloud domain | CLOU_INVALID_APPLICATION_CONFIG | RPBS > cloud |
| user_cloud_config | Configuration must be valid for cloud domain | CLOU_INVALID_USER_CONFIG | RPBS > cloud |
| platform targets_cloud_config | Configuration must be valid for cloud domain | CLOU_INVALID_PLATFORM TARGETS_CONFIG | RPBS > cloud |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| CLOU_START_ERROR | START denied: transition from Pending not allowed | ERROR |
| CLOU_COMPLETE_ERROR | COMPLETE denied: transition from Active not allowed | ERROR |
| CLOU_OPERATION_FAILED | FAIL denied: transition from Active not allowed | ERROR |
| CLOU_RETRY_ERROR | RETRY denied: transition from Failed not allowed | ERROR |
| CLOU_INVALID_APPLICATION_CONFIG | Validation failed: configuration must be valid for cloud domain | WARN |
| CLOU_INVALID_USER_CONFIG | Validation failed: configuration must be valid for cloud domain | WARN |
| CLOU_INVALID_PLATFORM TARGETS_CONFIG | Validation failed: configuration must be valid for cloud domain | WARN |

## Open Questions
- Specific cloud domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
