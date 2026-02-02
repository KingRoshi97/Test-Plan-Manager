# Execution Readiness Contract (ERC) — Security v1

## Overview
**Domain Slug:** security
**Version:** v1
**Lock Date:** 2026-01-29T03:56:00.097Z
**Content Hash:** ec80119495be61c6

## Verification Status
- [x] No critical UNKNOWNs in BELS (verified at lock time)
- [x] Policy rules have reason codes + messages
- [x] State machines have deny codes
- [x] Minimum acceptance scenarios defined

## Locked Content

### From BELS at Lock Time
# Business Entity Logic Specification (BELS) — Security

## Overview
**Domain Slug:** security
**Domain Prefix:** security
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)
<!-- Business rules that govern this domain -->
<!-- SourceRef: REBS_Product > Core Entities -->

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| security_001 | Open access for MVP | Any request | Allow without auth | PROJECT_OVERVIEW > Open Questions |
| security_002 | Future: require auth | Post-MVP | Validate session before API access | PROJECT_OVERVIEW > Open Questions |
| security_003 | Rate limiting | High request volume | Throttle requests per IP | PROJECT_OVERVIEW > Platforms |

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: Session
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| none | login | active | SECURITY_AUTH_001 | PROJECT_OVERVIEW > Open Questions |
| active | logout | none | - | PROJECT_OVERVIEW > Open Questions |
| active | expire | none | SECURITY_SESSION_001 | PROJECT_OVERVIEW > Open Questions |

### Entity: AccessControl
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| checking | allow | allowed | - | PROJECT_OVERVIEW > Open Questions |
| checking | deny | denied | SECURITY_ACCESS_001 | PROJECT_OVERVIEW > Open Questions |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| Session.token | Valid JWT format (future) | SECURITY_VAL_001 | PROJECT_OVERVIEW > Open Questions |
| Request.ip | Valid IP address | SECURITY_VAL_002 | PROJECT_OVERVIEW > Platforms |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| SECURITY_ACCESS_001 | Access denied | ERROR |
| SECURITY_AUTH_001 | Authentication failed | ERROR |
| SECURITY_SESSION_001 | Session expired | WARNING |

## Open Questions
- Authentication mechanism deferred to post-MVP per PROJECT_OVERVIEW


## Implementation Notes
- This ERC was generated from the BELS document at lock time
- Any changes to business logic must go through a new version
- Implementation must match exactly what is specified here

## Sign-off
- **Locked by:** assembler:lock script
- **Lock date:** 2026-01-29T03:56:00.097Z
- **Hash:** ec80119495be61c6
