# Open Questions — Web

## Overview
**Domain Slug:** web
**Generated:** 2026-01-28T21:41:20.108Z
**Updated:** Resolved for MVP

## Unresolved Questions

### From Draft Process
- ~~State machine transitions need stakeholder validation~~ RESOLVED: Defined in BELS_web.md
- ~~Specific error messages need confirmation~~ RESOLVED: Defined in BELS_web.md
- ~~Implementation details are UNKNOWN~~ RESOLVED: React + Tailwind per PROJECT_OVERVIEW

### Entity-Specific
- ~~Entity ownership boundaries need clarification~~ RESOLVED: See DDES_web.md
- ~~Cross-domain interactions need definition~~ RESOLVED: Web calls API domain

### Implementation
- Technical requirements: React 18, Tailwind CSS, TanStack Query
- Performance requirements: Standard web performance (deferred to implementation)
- Integration details: Uses /api/* endpoints from API domain

## Resolution Tracking

| Question ID | Question | Status | Resolution |
|-------------|----------|--------|------------|
| Q001 | Entity ownership | RESOLVED | See DDES_web.md |
| Q002 | State transitions | RESOLVED | See BELS_web.md |
| Q003 | Error handling | RESOLVED | See BELS_web.md reason codes |
