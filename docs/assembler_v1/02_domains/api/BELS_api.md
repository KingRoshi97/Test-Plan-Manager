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
| api_002 | Always print ASSEMBLER_REPORT | Script run completes | Print report with created/modified/skipped/failed | TARGET_OUTLINE > Constraints |

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: Run
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | start | running | UNKNOWN | REBS_Product > Run |
| running | complete | completed | UNKNOWN | REBS_Product > Run |
| running | fail | failed | API_RUN_003 | REBS_Product > Run |
| completed | package | bundled | UNKNOWN | REBS_Product > Run |

### Entity: DomainPack
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > DomainPack |

### Entity: Artifact
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > Artifact |

### Entity: VerifyResult
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > VerifyResult |

### Entity: ERC
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| draft | verify | verified | API_VERIFY_001 | REBS_Product > ERC |
| verified | lock | locked | API_LOCK_001 | REBS_Product > ERC |

### Entity: Bundle
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > Bundle |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| Run.id | Required, UUID format | UNKNOWN | REBS_Product > Run |
| DomainPack.id | Required, UUID format | UNKNOWN | REBS_Product > DomainPack |
| Artifact.id | Required, UUID format | UNKNOWN | REBS_Product > Artifact |
| VerifyResult.id | Required, UUID format | UNKNOWN | REBS_Product > VerifyResult |
| ERC.id | Required, UUID format | UNKNOWN | REBS_Product > ERC |
| Bundle.id | Required, UUID format | UNKNOWN | REBS_Product > Bundle |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| API_RUN_001 | Run not found | ERROR |
| API_RUN_003 | Run failed | ERROR |
| API_VERIFY_001 | Verification failed | ERROR |
| API_LOCK_001 | Cannot lock - UNKNOWNs exist | ERROR |

## Open Questions
<!-- Questions generated during draft -->
- Complete state machine transitions need validation
- Error codes need confirmation from stakeholders
- Specific implementation details: UNKNOWN
