# Domain Interface Map (DIM) — {{DOMAIN_NAME}}

<!-- AXION:TEMPLATE_CONTRACT:v1 -->
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

CASCADE POSITION (fill priority 7 of 13):
- Upstream (read from): DDES (entity ownership determines exposed interfaces), RPBS (§5 journey steps crossing domain boundaries, §9 integrations), BELS (state machine events → cross-domain notifications), domains.json (dependency graph)
- Downstream (feeds into): TESTPLAN (API contract tests), ERC (locked interfaces at lock time), contracts module (TypeScript types and Zod schemas), backend module (route implementation), frontend module (API client calls)
- DIM is the contract surface — it defines how domains communicate and is critical for code generation accuracy
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

## Standard Error Response Contract

<!-- AGENT: Define the standard error response shape that ALL interfaces in this domain use.
This ensures consistent error handling across the entire API surface.

RULES:
- All error responses must use the same JSON structure
- Error codes must reference BELS Reason Codes
- Include a machine-readable code AND a human-readable message
- Include a request ID for debugging (if applicable)

EXAMPLE:
```json
{
  "error": {
    "code": "RECIPE_NOT_FOUND",
    "message": "The requested recipe could not be found.",
    "status": 404,
    "details": {},
    "requestId": "req_abc123"
  }
}
```
-->

```json
UNKNOWN
```

### Error Response Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| error.code | string | Yes | SCREAMING_SNAKE_CASE reason code from BELS |
| error.message | string | Yes | Human-readable description |
| error.status | number | Yes | HTTP status code |
| error.details | object | No | Additional context (field errors, limits, etc.) |
| error.requestId | string | No | Unique request identifier for debugging |

---

## API Versioning Strategy

<!-- AGENT: Define how this domain's interfaces evolve over time without breaking consumers.

RULES:
- Specify the versioning mechanism (URL path, header, query param, or none)
- Define what constitutes a breaking change
- Specify the deprecation policy (how long old versions are supported)
- If no versioning is needed (MVP), state that explicitly

EXAMPLE:
- Versioning mechanism: URL path prefix (/api/v1/...)
- Breaking changes: Removing a field, changing a field type, removing an endpoint
- Non-breaking changes: Adding optional fields, adding new endpoints
- Deprecation policy: Old versions supported for 6 months after new version release
-->

- **Versioning mechanism:** UNKNOWN
- **Breaking change definition:** UNKNOWN
- **Deprecation policy:** UNKNOWN

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
