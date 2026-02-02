# Execution Readiness Contract (ERC) — Infrastructure v1

## Overview
**Domain Slug:** infra
**Version:** v1
**Lock Date:** 2026-01-29T03:55:59.726Z
**Content Hash:** 03bb107f62bc0359

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — Infrastructure

## Overview
**Domain Slug:** infra
**Domain Prefix:** infra
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)
<!-- Business rules that govern this domain -->
<!-- SourceRef: REBS_Product > Core Entities -->

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| infra_001 | No overwrite by default | File exists at target path | Skip write unless force flag set | TARGET_OUTLINE > Constraints |
| infra_002 | Create parent directories | Writing to nested path | Ensure all parent dirs exist | PROJECT_OVERVIEW > Platforms |
| infra_003 | Validate paths | Any file operation | Reject paths outside workspace | PROJECT_OVERVIEW > Constraints |

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: FileSystem
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| ready | read | ready | INFRA_FILE_001 | PROJECT_OVERVIEW > Platforms |
| ready | write | ready | INFRA_FILE_002 | PROJECT_OVERVIEW > Platforms |
| ready | error | error | INFRA_IO_001 | PROJECT_OVERVIEW > Platforms |

### Entity: ZipBuilder
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| idle | start | collecting | - | PROJECT_OVERVIEW > Key Flows |
| collecting | add_file | collecting | - | PROJECT_OVERVIEW > Key Flows |
| collecting | finalize | complete | - | PROJECT_OVERVIEW > Key Flows |
| collecting | error | failed | INFRA_ZIP_001 | PROJECT_OVERVIEW > Key Flows |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| filePath | Required, valid path format | INFRA_VAL_001 | PROJECT_OVERVIEW > Platforms |
| filePath | Must be within workspace | INFRA_VAL_002 | PROJECT_OVERVIEW > Constraints |
| zipPath | Required, .zip extension | INFRA_VAL_003 | PROJECT_OVERVIEW > Key Flows |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| INFRA_FILE_001 | File not found | ERROR |
| INFRA_FILE_002 | File already exists (no overwrite) | WARNING |
| INFRA_IO_001 | I/O error during file operation | ERROR |
| INFRA_ZIP_001 | Failed to create zip archive | ERROR |

## Open Questions
- None - using local filesystem for MVP


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** assembler:lock script
- **Lock date:** 2026-01-29T03:55:59.726Z
- **Hash:** 03bb107f62bc0359
