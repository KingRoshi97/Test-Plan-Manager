# Domain Interface Map (DIM) — state

<!-- AXION:CORE_DOC:DIM -->

## Overview
**Domain Slug:** state
**Prefix:** st
**Type:** business
**Project:** Application

---

## Exposed Interfaces

| Interface ID | Type | Method | Path/Name | Description | Consumer(s) | Contract Ref |
|-------------|------|--------|-----------|-------------|-------------|--------------|
| st_IF_001 | REST | GET | /api/applications | List all application records | frontend | contracts/state |
| st_IF_002 | REST | GET | /api/users | List all user records | frontend | contracts/state |
| st_IF_003 | REST | GET | /api/platform targetss | List all platform targets records | frontend | contracts/state |
| st_IF_004 | REST | POST | /api/applications | Create a new application | frontend | contracts/state |
| st_IF_005 | REST | POST | /api/users | Create a new user | frontend | contracts/state |

---

## Consumed Interfaces

| Interface ID | Provider Module | Type | Description | Contract Ref |
|-------------|----------------|------|-------------|--------------|
| backend_IF_001 | backend | REST | Type definitions for state operations | contracts/backend |

---

## Event Contracts

| Event Name | Direction | Payload Schema | Trigger | Consumer(s) | Guarantee |
|-----------|-----------|---------------|---------|-------------|-----------|
| APPLICATION_CREATED | emit | { applicationId, createdBy } | New application is created | state, frontend | at-least-once |
| USER_CREATED | emit | { userId, createdBy } | New user is created | state, frontend | at-least-once |

---

## Data Flow Summary

- **Inbound:** Client requests arrive via REST API endpoints defined above
- **Processing:** Validate against contracts, apply state business rules, persist changes
- **Outbound:** Return processed data to consumers, emit domain events for state updates

---

## Open Questions
- Specific rate limiting policies for state endpoints need definition
- Event delivery guarantees need infrastructure planning
