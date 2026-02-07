# Business Entity Logic Specification (BELS) — database

## Overview
**Domain Slug:** database
**Focus:** database schema, migrations, and data models
**Status:** DRAFT - Truth Candidates
**Project:** Application

## Policy Rules (Candidates)

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| DB_001 | Application table must have primary key and timestamps | When application table is created or migrated | Ensure id, createdAt, updatedAt columns exist | RPBS > Database > Application Model |
| DB_002 | User table must have primary key and timestamps | When user table is created or migrated | Ensure id, createdAt, updatedAt columns exist | RPBS > Database > User Model |
| DB_003 | Platform targets table must have primary key and timestamps | When platform targets table is created or migrated | Ensure id, createdAt, updatedAt columns exist | RPBS > Database > Platform targets Model |

## State Machines (Candidates)

### Entity: ApplicationRow
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| Draft | SAVE | Persisted | DB_SAVE_FAILED | RPBS > database |
| Persisted | UPDATE | Persisted | DB_UPDATE_FAILED | RPBS > database |
| Persisted | DELETE | Deleted | DB_DELETE_FAILED | RPBS > database |
| Persisted | ARCHIVE | Archived | DB_ARCHIVE_FAILED | RPBS > database |

## Validation Rules (Candidates)

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| application_data | Must satisfy all NOT NULL constraints | DB_NULL_APPLICATION_FIELD | RPBS > database |
| user_data | Must satisfy all NOT NULL constraints | DB_NULL_USER_FIELD | RPBS > database |
| platform targets_data | Must satisfy all NOT NULL constraints | DB_NULL_PLATFORM TARGETS_FIELD | RPBS > database |

## Reason Codes Referenced

| Code | Message | Severity |
|------|---------|----------|
| DB_SAVE_FAILED | SAVE denied: transition from Draft not allowed | ERROR |
| DB_UPDATE_FAILED | UPDATE denied: transition from Persisted not allowed | ERROR |
| DB_DELETE_FAILED | DELETE denied: transition from Persisted not allowed | ERROR |
| DB_ARCHIVE_FAILED | ARCHIVE denied: transition from Persisted not allowed | ERROR |
| DB_NULL_APPLICATION_FIELD | Validation failed: must satisfy all not null constraints | WARN |
| DB_NULL_USER_FIELD | Validation failed: must satisfy all not null constraints | WARN |
| DB_NULL_PLATFORM TARGETS_FIELD | Validation failed: must satisfy all not null constraints | WARN |

## Open Questions
- Specific database domain thresholds need stakeholder input
- Error recovery strategies need further definition
- Cross-module interaction patterns need validation
