# Screen Map — Platform

## Overview
**Domain Slug:** platform

## Note
The Platform domain does not have screens - it defines core entities and business rules. See DDES_platform.md for entity specifications.

## Entities Defined

### Entity: Run
- **Purpose:** Represents a single pipeline execution
- **States:** created, running, completed, failed, bundled
- **Used By:** API domain (endpoints), Web domain (status display)

### Entity: Project
- **Purpose:** Collection of runs (optional for MVP)
- **States:** created, active, archived
- **Used By:** Future project management features

### Entity: User
- **Purpose:** System user (optional for MVP - no auth)
- **States:** active, inactive
- **Used By:** Security domain when auth is enabled

### Entity: Bundle
- **Purpose:** Final zip package for agent handoff
- **States:** pending, created, downloaded
- **Used By:** API domain (download endpoint), Web domain (download button)

## Open Questions
- None - platform entities are well-defined in PROJECT_OVERVIEW
