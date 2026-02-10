# Domain Interface Map (DIM) — {{DOMAIN_NAME}}

<!-- AXION:CORE_DOC:DIM -->

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Prefix:** {{DOMAIN_PREFIX}}
**Type:** {{DOMAIN_TYPE}}

<!-- AXION:AGENT_GUIDANCE
PURPOSE: DIM defines all interfaces this domain EXPOSES to other domains and
all interfaces it CONSUMES from other domains. It is the "contract surface" of the domain.

This document feeds directly into:
- Contracts module (API types and schemas)
- Backend module (route implementation)
- Frontend module (API client calls)
- Integration tests (contract verification)

SOURCES TO DERIVE FROM:
1. DDES — entity ownership determines which interfaces this domain exposes
2. RPBS §5 User Journeys — journey steps crossing domain boundaries create interfaces
3. RPBS §9 Integrations — external service connections
4. domains.json — dependency graph shows which domains communicate
5. BELS — state machine events may need cross-domain notification

RULES:
- Every interface MUST have a unique ID using format: {{DOMAIN_PREFIX}}_IF_NNN
- Direction is critical: "expose" means this domain provides it; "consume" means it calls someone else
- Contract Ref should point to the contracts module document or schema where the full spec lives
- For REST APIs: define method, path, request/response shape
- For events: define event name, payload schema, delivery guarantee
-->

> Define all interfaces this domain exposes and consumes.
> Replace `[TBD]` with concrete content. Use `UNKNOWN` only when upstream truth is missing.

---

## Exposed Interfaces

<!-- AGENT: What does this domain provide to other domains or to the frontend?
These become API endpoints, shared functions, or exported types.

EXAMPLES:
| IF_ID | Type | Method | Path/Name | Description | Request Shape | Response Shape | Consumer(s) |
| fe_IF_001 | REST | GET | /api/recipes | List all recipes | { page, limit, filters } | { items: Recipe[], total } | frontend |
| fe_IF_002 | REST | POST | /api/recipes | Create a recipe | { title, ingredients, steps } | { recipe: Recipe } | frontend |
| fe_IF_003 | Event | — | RECIPE_PUBLISHED | Fired when recipe goes live | { recipeId, authorId } | — | notifications, search |
-->

| Interface ID | Type | Method | Path/Name | Description | Consumer(s) | Contract Ref |
|-------------|------|--------|-----------|-------------|-------------|--------------|
| {{DOMAIN_PREFIX}}_IF_001 | REST/Event/RPC | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| {{DOMAIN_PREFIX}}_IF_002 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

### Interface Details

<!-- AGENT: For each exposed interface, provide the full contract shape.
This is critical for the contracts module and code generation. -->

#### {{DOMAIN_PREFIX}}_IF_001
- **Type:** UNKNOWN
- **Auth Required:** Yes / No
- **Request Schema:**
  ```
  UNKNOWN
  ```
- **Response Schema:**
  ```
  UNKNOWN
  ```
- **Error Codes:** UNKNOWN (ref: BELS Reason Codes)
- **Rate Limit:** UNKNOWN

---

## Consumed Interfaces

<!-- AGENT: What does this domain need from OTHER domains?
These become API client calls, imported functions, or event subscriptions.
Cross-reference with the providing domain's DIM to ensure consistency.

EXAMPLE:
| Provider | Interface ID | Type | What This Domain Needs | Why |
| auth | auth_IF_001 | REST | GET /api/me — current user info | Display user profile in recipe cards |
| database | db_IF_003 | Function | saveRecipe() | Persist recipe to database |
-->

| Interface ID | Provider Module | Type | Description | Contract Ref |
|-------------|----------------|------|-------------|--------------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Event Contracts

<!-- AGENT: Events are async messages between domains. Define them carefully because
they create coupling between domains.

For each event:
- WHO emits it (source domain)
- WHAT triggers it (user action, system event, scheduled task)
- WHAT data it carries (payload schema)
- WHO listens for it (consumer domains)
- WHAT guarantee it has (at-least-once, exactly-once, best-effort)

EXAMPLE:
| Event Name | Direction | Payload Schema | Trigger | Consumer(s) | Guarantee |
| USER_REGISTERED | emit | { userId, email, name } | New user signs up | notifications, analytics | at-least-once |
| PAYMENT_COMPLETED | consume | { orderId, amount, userId } | Payment processor webhook | — | at-least-once |
-->

| Event Name | Direction | Payload Schema | Trigger | Consumer(s) | Guarantee |
|-----------|-----------|---------------|---------|-------------|-----------|
| UNKNOWN | emit/consume | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## Data Flow Summary

<!-- AGENT: Describe how data flows through this domain at a high level.
Think of it as: what comes IN, what is PROCESSED, and what goes OUT.

EXAMPLE:
- Inbound: User submits recipe form (frontend) → recipe data arrives via POST /api/recipes
- Processing: Validate recipe, generate slug, save to database, emit RECIPE_CREATED event
- Outbound: Return created recipe to frontend, notify followers via event -->

- **Inbound:** UNKNOWN
- **Processing:** UNKNOWN
- **Outbound:** UNKNOWN
- **Shared state:** UNKNOWN (any state this domain reads/writes that other domains also access)

---

## Interface Dependencies Graph

<!-- AGENT: Summarize the dependency relationships as a simple text diagram.
EXAMPLE:
frontend → [GET /api/recipes] → backend → [query recipes] → database
frontend → [POST /api/recipes] → backend → [save recipe] → database → [emit RECIPE_CREATED] → notifications
-->

```
UNKNOWN
```

---

## Open Questions
- UNKNOWN
