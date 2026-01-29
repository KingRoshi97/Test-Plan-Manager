# Business Entity Logic Specification (BELS) — API

## Overview
**Domain Slug:** api
**Domain Prefix:** api
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)
<!-- Business rules that govern this domain -->
<!-- SourceRef: REBS_Product > Core Entities -->

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| api_001 | Verify before lock | Lock requested | Check all verifications pass | TARGET_OUTLINE > Constraints |
| api_002 | Always print ROSHI_REPORT | Script run completes | Print report with created/modified/skipped/failed | TARGET_OUTLINE > Constraints |
| api_003 | Idea required | POST /api/runs called | Validate idea field present and min 10 chars | PROJECT_OVERVIEW > Key Flows |
| api_004 | Run must exist | Any /api/runs/:id endpoint | Return 404 if run not found | PROJECT_OVERVIEW > Core Objects |

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: Run
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | start | running | - | REBS_Product > Run |
| running | step_complete | running | - | REBS_Product > Run |
| running | complete | completed | - | REBS_Product > Run |
| running | fail | failed | API_RUN_003 | REBS_Product > Run |
| completed | package | bundled | - | REBS_Product > Run |

### Entity: DomainPack
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| pending | generate | generated | - | REBS_Product > DomainPack |
| generated | seed | seeded | - | REBS_Product > DomainPack |
| seeded | draft | drafted | - | REBS_Product > DomainPack |

### Entity: Artifact
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| pending | create | created | - | REBS_Product > Artifact |
| created | modify | modified | - | REBS_Product > Artifact |

### Entity: VerifyResult
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| pending | verify | passed | - | REBS_Product > VerifyResult |
| pending | verify | failed | API_VERIFY_001 | REBS_Product > VerifyResult |

### Entity: ERC
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| draft | verify | verified | API_VERIFY_001 | REBS_Product > ERC |
| verified | lock | locked | API_LOCK_001 | REBS_Product > ERC |

### Entity: Bundle
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| pending | package | created | - | REBS_Product > Bundle |
| created | download | downloaded | - | REBS_Product > Bundle |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| Run.id | Required, UUID format | API_VAL_001 | REBS_Product > Run |
| Run.idea | Required, min 10 chars | API_VAL_002 | PROJECT_OVERVIEW > Key Flows |
| DomainPack.id | Required, UUID format | API_VAL_003 | REBS_Product > DomainPack |
| Artifact.id | Required, UUID format | API_VAL_004 | REBS_Product > Artifact |
| Bundle.id | Required, UUID format | API_VAL_005 | REBS_Product > Bundle |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| API_RUN_001 | Run not found | ERROR |
| API_RUN_003 | Run failed | ERROR |
| API_VERIFY_001 | Verification failed | ERROR |
| API_LOCK_001 | Cannot lock - UNKNOWNs exist | ERROR |
| API_VAL_001 | Invalid run ID format | ERROR |
| API_VAL_002 | Idea is required (min 10 chars) | ERROR |

## Open Questions
- None - API behavior is well-defined for MVP
