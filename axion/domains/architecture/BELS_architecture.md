# Business Entity Logic Specification (BELS) — architecture

## Overview
**Domain Slug:** architecture
**Focus:** system structure and component organization
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| ARCH_001 | Application component must follow layered architecture pattern | When application operations are invoked | Route through service layer before data access | RPBS > Architecture > Layered Pattern |
| ARCH_002 | User component must follow layered architecture pattern | When user operations are invoked | Route through service layer before data access | RPBS > Architecture > Layered Pattern |
| ARCH_003 | Platform targets component must follow layered architecture pattern | When platform targets operations are invoked | Route through service layer before data access | RPBS > Architecture > Layered Pattern |

## State Machines (Candidates)

### Entity: Application
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Uninitialized | INIT | Ready | ARCH_NOT_READY | RPBS > architecture |
| Ready | PROCESS | Active | ARCH_UNAVAILABLE | RPBS > architecture |
| Active | COMPLETE | Ready | ARCH_BUSY | RPBS > architecture |
| Active | ERROR | Degraded | ARCH_ERROR | RPBS > architecture |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_config | Must conform to defined schema | ARCH_INVALID_APPLICATION_CONFIG | RPBS > architecture |
| user_config | Must conform to defined schema | ARCH_INVALID_USER_CONFIG | RPBS > architecture |
| platform targets_config | Must conform to defined schema | ARCH_INVALID_PLATFORM TARGETS_CONFIG | RPBS > architecture |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| ARCH_NOT_READY | INIT denied: transition from Uninitialized not allowed | ERROR |
| ARCH_UNAVAILABLE | PROCESS denied: transition from Ready not allowed | ERROR |
| ARCH_BUSY | COMPLETE denied: transition from Active not allowed | ERROR |
| ARCH_ERROR | ERROR denied: transition from Active not allowed | ERROR |
| ARCH_INVALID_APPLICATION_CONFIG | Validation failed: must conform to defined schema | WARN |
| ARCH_INVALID_USER_CONFIG | Validation failed: must conform to defined schema | WARN |
| ARCH_INVALID_PLATFORM TARGETS_CONFIG | Validation failed: must conform to defined schema | WARN |

## Open Questions
- Specific architecture domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
