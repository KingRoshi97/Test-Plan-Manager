# Domain Interface Map (DIM) — mobile

<!-- AXION:CORE_DOC:DIM -->

## Overview
**Domain Slug:** mobile
**Prefix:** mo
**Type:** business
**Project:** note-pad-app-test

---

## Exposed Interfaces

| Interface ID | Type | Method | Path/Name | Description | Consumer(s) | Contract Ref |
|-------------|------|--------|-----------|-------------|-------------|--------------|
| mo_IF_001 | REST | GET | /api/notes | List all note records | frontend | contracts/mobile |
| mo_IF_002 | REST | GET | /api/platform targetss | List all platform targets records | frontend | contracts/mobile |
| mo_IF_003 | REST | GET | /api/integrations complexitys | List all integrations complexity records | frontend | contracts/mobile |
| mo_IF_004 | REST | POST | /api/notes | Create a new note | frontend | contracts/mobile |
| mo_IF_005 | REST | POST | /api/platform targetss | Create a new platform targets | frontend | contracts/mobile |

---

## Consumed Interfaces

| Interface ID | Provider Module | Type | Description | Contract Ref |
|-------------|----------------|------|-------------|--------------|
| frontend_IF_001 | frontend | REST | Type definitions for mobile operations | contracts/frontend |

---

## Event Contracts

| Event Name | Direction | Payload Schema | Trigger | Consumer(s) | Guarantee |
|-----------|-----------|---------------|---------|-------------|-----------|
| NOTE_CREATED | emit | { noteId, createdBy } | New note is created | state, frontend | at-least-once |
| PLATFORM TARGETS_CREATED | emit | { platform targetsId, createdBy } | New platform targets is created | state, frontend | at-least-once |

---

## Data Flow Summary

- **Inbound:** Client requests arrive via REST API endpoints defined above
- **Processing:** Validate against contracts, apply mobile business rules, persist changes
- **Outbound:** Return processed data to consumers, emit domain events for state updates

---

## Open Questions
- Specific rate limiting policies for mobile endpoints need definition
- Event delivery guarantees need infrastructure planning
