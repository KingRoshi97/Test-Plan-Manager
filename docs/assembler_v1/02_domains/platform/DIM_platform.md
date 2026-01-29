# Domain Interface Map (DIM) — Platform

## Overview
**Domain Slug:** platform

## Exposed Interfaces
<!-- APIs/interfaces this domain exposes -->

| Interface | Type | Description | Consumers |
|-----------|------|-------------|-----------|
| Run entity | TypeScript type | Run data model | api, web |
| User entity | TypeScript type | User data model (optional for MVP) | security |
| Project entity | TypeScript type | Project data model (optional for MVP) | api |
| Bundle entity | TypeScript type | Bundle data model | api |
| IStorage interface | TypeScript interface | Storage operations | api |

## Consumed Interfaces
<!-- Interfaces this domain consumes from others -->

| Interface | Provider Domain | Description |
|-----------|-----------------|-------------|
| N/A | N/A | Platform is foundation, consumes nothing |

## Events Published
<!-- Events this domain publishes -->

| Event Name | Payload | Subscribers |
|------------|---------|-------------|
| N/A | N/A | No events for MVP |

## Events Subscribed
<!-- Events this domain listens to -->

| Event Name | Publisher Domain | Handler |
|------------|------------------|---------|
| N/A | N/A | No event subscriptions for MVP |

## Open Questions
- None - platform interfaces are well-defined
