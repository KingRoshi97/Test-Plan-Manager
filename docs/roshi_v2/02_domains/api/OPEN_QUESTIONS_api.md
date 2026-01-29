# Open Questions — API

## Overview
**Domain Slug:** api
**Generated:** 2026-01-28T21:41:20.107Z
**Updated:** Resolved for MVP

## Unresolved Questions

### From Draft Process
- ~~State machine transitions need stakeholder validation~~ RESOLVED: Defined in BELS_api.md
- ~~Specific error messages need confirmation~~ RESOLVED: Defined in BELS_api.md
- ~~Implementation details are UNKNOWN~~ RESOLVED: Express.js per PROJECT_OVERVIEW

### Entity-Specific
- ~~Entity ownership boundaries need clarification~~ RESOLVED: See DDES_api.md
- ~~Cross-domain interactions need definition~~ RESOLVED: API orchestrates pipeline scripts

### Implementation
- Technical requirements: Express.js, Node.js
- Performance requirements: Standard API performance (deferred to implementation)
- Integration details: Calls roshi scripts via child_process or direct import

## Resolution Tracking

| Question ID | Question | Status | Resolution |
|-------------|----------|--------|------------|
| Q001 | Entity ownership | RESOLVED | See DDES_api.md |
| Q002 | State transitions | RESOLVED | See BELS_api.md |
| Q003 | Error handling | RESOLVED | See BELS_api.md reason codes |
