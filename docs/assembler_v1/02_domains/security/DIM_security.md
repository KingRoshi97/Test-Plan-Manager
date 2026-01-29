# Domain Interface Map (DIM) — Security

## Overview
**Domain Slug:** security

## Note
Security domain is minimal for MVP - no authentication required. Interfaces listed are for future implementation.

## Exposed Interfaces (Future)
<!-- APIs/interfaces this domain exposes -->

| Interface | Type | Description | Consumers |
|-----------|------|-------------|-----------|
| authMiddleware | Express middleware | Validate session (future) | api |
| rateLimit | Express middleware | Throttle requests (future) | api |
| Session.create | Function | Create user session (future) | api |
| Session.validate | Function | Validate session token (future) | api |

## Consumed Interfaces (Future)
<!-- Interfaces this domain consumes from others -->

| Interface | Provider Domain | Description |
|-----------|-----------------|-------------|
| User entity | platform | User data for authentication |

## Events Published (Future)
<!-- Events this domain publishes -->

| Event Name | Payload | Subscribers |
|------------|---------|-------------|
| session.created | { userId, sessionId } | Logging (future) |
| session.expired | { sessionId } | Cleanup (future) |

## Events Subscribed (Future)
<!-- Events this domain listens to -->

| Event Name | Publisher Domain | Handler |
|------------|------------------|---------|
| N/A | N/A | No subscriptions for MVP |

## MVP State
- No authentication required
- All endpoints publicly accessible
- No rate limiting

## Open Questions
- Authentication mechanism deferred to post-MVP
