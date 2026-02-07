# Business Entity Logic Specification (BELS) — devex

## Overview
**Domain Slug:** devex
**Focus:** devex domain concerns
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| DEVE_001 | Application operations must follow devex domain rules | When application interacts with devex subsystem | Apply devex-specific validation and processing | RPBS > devex > Application Rules |
| DEVE_002 | User operations must follow devex domain rules | When user interacts with devex subsystem | Apply devex-specific validation and processing | RPBS > devex > User Rules |
| DEVE_003 | Platform targets operations must follow devex domain rules | When platform targets interacts with devex subsystem | Apply devex-specific validation and processing | RPBS > devex > Platform targets Rules |

## State Machines (Candidates)

### Entity: ApplicationProcess
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Pending | START | Active | DEVE_START_ERROR | RPBS > devex |
| Active | COMPLETE | Done | DEVE_COMPLETE_ERROR | RPBS > devex |
| Active | FAIL | Failed | DEVE_OPERATION_FAILED | RPBS > devex |
| Failed | RETRY | Active | DEVE_RETRY_ERROR | RPBS > devex |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_devex_config | Configuration must be valid for devex domain | DEVE_INVALID_APPLICATION_CONFIG | RPBS > devex |
| user_devex_config | Configuration must be valid for devex domain | DEVE_INVALID_USER_CONFIG | RPBS > devex |
| platform targets_devex_config | Configuration must be valid for devex domain | DEVE_INVALID_PLATFORM TARGETS_CONFIG | RPBS > devex |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| DEVE_START_ERROR | START denied: transition from Pending not allowed | ERROR |
| DEVE_COMPLETE_ERROR | COMPLETE denied: transition from Active not allowed | ERROR |
| DEVE_OPERATION_FAILED | FAIL denied: transition from Active not allowed | ERROR |
| DEVE_RETRY_ERROR | RETRY denied: transition from Failed not allowed | ERROR |
| DEVE_INVALID_APPLICATION_CONFIG | Validation failed: configuration must be valid for devex domain | WARN |
| DEVE_INVALID_USER_CONFIG | Validation failed: configuration must be valid for devex domain | WARN |
| DEVE_INVALID_PLATFORM TARGETS_CONFIG | Validation failed: configuration must be valid for devex domain | WARN |

## Open Questions
- Specific devex domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
