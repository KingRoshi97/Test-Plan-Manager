# Domain Interface Map (DIM) — frontend

<!-- AXION:CORE_DOC:DIM -->

## Overview
**Domain Slug:** frontend
**Prefix:** fr
**Type:** business
**Project:** Application

---

## Exposed Interfaces

| Interface ID | Type | Method | Path/Name | Description | Consumer(s) | Contract Ref |
|-------------|------|--------|-----------|-------------|-------------|--------------|
| fr_IF_001 | REST | GET | /api/applications | List all application records | frontend | contracts/frontend |
| fr_IF_002 | REST | GET | /api/users | List all user records | frontend | contracts/frontend |
| fr_IF_003 | REST | GET | /api/platform targetss | List all platform targets records | frontend | contracts/frontend |
| fr_IF_004 | REST | POST | /api/applications | Create a new application | frontend | contracts/frontend |
| fr_IF_005 | REST | POST | /api/users | Create a new user | frontend | contracts/frontend |

---

## Consumed Interfaces

| Interface ID | Provider Module | Type | Description | Contract Ref |
|-------------|----------------|------|-------------|--------------|
| state_IF_001 | state | REST | Type definitions for frontend operations | contracts/state |

---

## Event Contracts

| Event Name | Direction | Payload Schema | Trigger | Consumer(s) | Guarantee |
|-----------|-----------|---------------|---------|-------------|-----------|
| APPLICATION_CREATED | emit | { applicationId, createdBy } | New application is created | state, frontend | at-least-once |
| USER_CREATED | emit | { userId, createdBy } | New user is created | state, frontend | at-least-once |

---

## Data Flow Summary

- **Inbound:** Client requests arrive via REST API endpoints defined above
- **Processing:** Validate against contracts, apply frontend business rules, persist changes
- **Outbound:** Return processed data to consumers, emit domain events for state updates

---

## Open Questions
- Specific rate limiting policies for frontend endpoints need definition
- Event delivery guarantees need infrastructure planning
