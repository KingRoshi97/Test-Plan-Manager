# Business Entity Logic Specification (BELS) — security

## Overview
**Domain Slug:** security
**Focus:** security domain concerns
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| SECU_001 | Application operations must follow security domain rules | When application interacts with security subsystem | Apply security-specific validation and processing | RPBS > security > Application Rules |
| SECU_002 | User operations must follow security domain rules | When user interacts with security subsystem | Apply security-specific validation and processing | RPBS > security > User Rules |
| SECU_003 | Platform targets operations must follow security domain rules | When platform targets interacts with security subsystem | Apply security-specific validation and processing | RPBS > security > Platform targets Rules |

## State Machines (Candidates)

### Entity: ApplicationProcess
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Pending | START | Active | SECU_START_ERROR | RPBS > security |
| Active | COMPLETE | Done | SECU_COMPLETE_ERROR | RPBS > security |
| Active | FAIL | Failed | SECU_OPERATION_FAILED | RPBS > security |
| Failed | RETRY | Active | SECU_RETRY_ERROR | RPBS > security |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_security_config | Configuration must be valid for security domain | SECU_INVALID_APPLICATION_CONFIG | RPBS > security |
| user_security_config | Configuration must be valid for security domain | SECU_INVALID_USER_CONFIG | RPBS > security |
| platform targets_security_config | Configuration must be valid for security domain | SECU_INVALID_PLATFORM TARGETS_CONFIG | RPBS > security |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| SECU_START_ERROR | START denied: transition from Pending not allowed | ERROR |
| SECU_COMPLETE_ERROR | COMPLETE denied: transition from Active not allowed | ERROR |
| SECU_OPERATION_FAILED | FAIL denied: transition from Active not allowed | ERROR |
| SECU_RETRY_ERROR | RETRY denied: transition from Failed not allowed | ERROR |
| SECU_INVALID_APPLICATION_CONFIG | Validation failed: configuration must be valid for security domain | WARN |
| SECU_INVALID_USER_CONFIG | Validation failed: configuration must be valid for security domain | WARN |
| SECU_INVALID_PLATFORM TARGETS_CONFIG | Validation failed: configuration must be valid for security domain | WARN |

## Open Questions
- Specific security domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
