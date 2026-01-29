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
