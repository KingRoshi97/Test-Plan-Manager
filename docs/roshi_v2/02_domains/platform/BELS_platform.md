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

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: User
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > User |

### Entity: Project
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| created | activate | active | UNKNOWN | REBS_Product > Project |
| active | archive | archived | UNKNOWN | REBS_Product > Project |

### Entity: TemplatePack
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > TemplatePack |

### Entity: SourceRef
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | REBS_Product > SourceRef |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| User.id | Required, UUID format | UNKNOWN | REBS_Product > User |
| Project.id | Required, UUID format | UNKNOWN | REBS_Product > Project |
| TemplatePack.id | Required, UUID format | UNKNOWN | REBS_Product > TemplatePack |
| SourceRef.id | Required, UUID format | UNKNOWN | REBS_Product > SourceRef |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| PLATFORM_USER_001 | User not found | ERROR |
| PLATFORM_PROJECT_001 | Project not found | ERROR |

## Open Questions
<!-- Questions generated during draft -->
- Complete state machine transitions need validation
- Error codes need confirmation from stakeholders
- Specific implementation details: UNKNOWN
