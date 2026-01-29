# Execution Readiness Contract (ERC) — Platform v1

## Overview
**Domain Slug:** platform
**Version:** v1
**Lock Date:** 2026-01-29T03:55:58.510Z
**Content Hash:** 7534db15b7898870

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — Platform

## Overview
**Domain Slug:** platform
**Domain Prefix:** platform
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)
<!-- Business rules that govern this domain -->
<!-- SourceRef: REBS_Product > Core Entities -->

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| platform_001 | No invention rule | Missing info detected | Write UNKNOWN and log to Open Questions | TARGET_OUTLINE > Constraints |
| platform_002 | No overwrite rule | File exists | Skip file, record in ROSHI_REPORT skipped list | TARGET_OUTLINE > Constraints |
| platform_003 | Verify before lock | Lock requested | All domains must pass verification | TARGET_OUTLINE > Constraints |
| platform_004 | ROSHI_REPORT required | Any script completes | Print report with created/modified/skipped/failed | TARGET_OUTLINE > Constraints |

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: User
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| active | deactivate | inactive | - | REBS_Product > User |
| inactive | activate | active | - | REBS_Product > User |

### Entity: Project
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | activate | active | - | REBS_Product > Project |
| active | archive | archived | - | REBS_Product > Project |
| archived | restore | active | - | REBS_Product > Project |

### Entity: Run
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | execute | running | - | REBS_Product > Run |
| running | complete | completed | - | REBS_Product > Run |
| running | fail | failed | PLATFORM_RUN_001 | REBS_Product > Run |
| completed | package | bundled | - | REBS_Product > Run |

### Entity: TemplatePack
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| draft | publish | published | - | REBS_Product > TemplatePack |
| published | deprecate | deprecated | - | REBS_Product > TemplatePack |

### Entity: SourceRef
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| active | invalidate | invalid | - | REBS_Product > SourceRef |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| User.id | Required, UUID format | PLATFORM_VAL_001 | REBS_Product > User |
| Project.id | Required, UUID format | PLATFORM_VAL_002 | REBS_Product > Project |
| Run.id | Required, UUID format | PLATFORM_VAL_003 | REBS_Product > Run |
| Run.idea | Required, min 10 chars | PLATFORM_VAL_004 | PROJECT_OVERVIEW > Key Flows |
| TemplatePack.id | Required, UUID format | PLATFORM_VAL_005 | REBS_Product > TemplatePack |
| SourceRef.id | Required, UUID format | PLATFORM_VAL_006 | REBS_Product > SourceRef |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| PLATFORM_USER_001 | User not found | ERROR |
| PLATFORM_PROJECT_001 | Project not found | ERROR |
| PLATFORM_RUN_001 | Pipeline execution failed | ERROR |
| PLATFORM_VAL_001 | Invalid user ID format | ERROR |
| PLATFORM_VAL_002 | Invalid project ID format | ERROR |
| PLATFORM_VAL_003 | Invalid run ID format | ERROR |
| PLATFORM_VAL_004 | Idea is required (min 10 chars) | ERROR |

## Open Questions
- None - platform domain is well-defined for MVP


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** roshi:lock script
- **Lock date:** 2026-01-29T03:55:58.510Z
- **Hash:** 7534db15b7898870
