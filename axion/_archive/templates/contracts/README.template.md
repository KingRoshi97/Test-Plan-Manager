<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:contracts -->
<!-- AXION:PREFIX:contract -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Contracts — AXION Module Template (Blank State)

**Module slug:** `contracts`  
**Prefix:** `contract`  
**Description:** API contracts, interfaces, and data schemas

> Blank-state scaffold. Populate during AXION stages.
> Replace `[TBD]` with concrete content. Use `N/A — <reason>` if not applicable. Use `UNKNOWN` only when upstream truth is missing.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- Do not rename section keys. Titles may be edited, keys may not.
- If upstream meaning is missing, write `UNKNOWN` and add it to **Open Questions**.
- If non-applicable, write `N/A — <reason>` (never leave blank).

<!-- AXION:SECTION:RPBS_DERIVATIONS -->
## RPBS_DERIVATIONS (Required)
- Tenancy/Org Model: UNKNOWN (source: RPBS §21 Tenancy / Organization Model)
- Actors & Permission Intents: UNKNOWN (source: RPBS §3 Actors & Permission Intents)
- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)
- Non-Functional Profile implications: N/A (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:CONTRACT_SCOPE -->
## Scope & Ownership
<!-- AGENT: Contracts module owns ALL shared types, API surface definitions, error envelopes, and event schemas.
"Owns" = API endpoint definitions, request/response type schemas, error codes/envelopes, shared domain events, versioning rules.
"Does NOT own" = implementation of endpoints (backend), database schema (database), UI consumption of APIs (frontend), auth enforcement logic (auth).
Common mistake: contracts should be implementation-agnostic — never reference specific frameworks, ORMs, or runtime details here. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:CONTRACT_API_SURFACE -->
## API Surface Inventory
<!-- AGENT: Aggregate ALL DIM exposed interfaces across all domain modules.
Endpoint list = every public API endpoint with: HTTP method, path, purpose, owning domain module (e.g., POST /api/users → auth module).
Ownership by module = group endpoints by which backend module implements them — this is the single source of truth for "what endpoints exist."
Common mistake: listing only REST endpoints — include WebSocket channels, GraphQL operations, or RPC methods if applicable. -->
- Endpoint list (method, path, purpose): [TBD]
- Ownership by module: [TBD]


<!-- AXION:SECTION:CONTRACT_SCHEMAS -->
## Schemas & Types
<!-- AGENT: Define Zod schemas (or equivalent) for every request/response shape from DIM interfaces.
Request/response schemas = for each endpoint, the exact shape of request body, query params, path params, and response body.
Canonical types = shared type definitions (User, Order, etc.) that multiple modules reference — defined ONCE here, imported elsewhere.
Common mistake: allowing modules to define their own versions of shared types — all shared types must be canonical in contracts. -->
- Request/response schema references: [TBD]
- Canonical type definitions and versioning: [TBD]


<!-- AXION:SECTION:CONTRACT_ERRORS -->
## Error Model
<!-- AGENT: Define error envelope from RPBS §15 Error Handling + aggregate BELS reason codes across all domains.
Error envelope = standard shape for all API errors (e.g., { error: { code, message, details } }), HTTP status code mapping.
Error codes = enumerated list of all application error codes with meanings (e.g., AUTH_001: "Invalid credentials", VALIDATION_002: "Email format invalid").
Client-facing vs internal = which error details are safe to show users vs which must be sanitized (never expose stack traces or internal IDs to clients).
Common mistake: using generic "Something went wrong" for every error — provide actionable error codes that the frontend can use to show specific messages. -->
- Error envelope standard: [TBD]
- Error codes list + meanings: [TBD]
- Client-facing vs internal errors: [TBD]


<!-- AXION:SECTION:CONTRACT_VERSIONING -->
## Compatibility & Versioning
<!-- AGENT: Define the API versioning strategy for this project.
Versioning rules = URL-based (/api/v1/), header-based, or no versioning (for internal-only APIs) — pick one and justify.
Backward compatibility = what changes are backward-compatible (adding optional fields, new endpoints) vs breaking (removing fields, changing types).
Deprecation policy = how long deprecated endpoints remain available, how deprecation is communicated (headers, docs, changelog).
Common mistake: versioning too early for an MVP — if there are no external consumers, "no versioning yet" with a plan is acceptable. -->
- Versioning rules: [TBD]
- Backward compatibility guarantees: [TBD]
- Deprecation policy: [TBD]


<!-- AXION:SECTION:CONTRACT_EVENTS -->
## Events, Webhooks, Async Contracts
<!-- AGENT: Aggregate all domain events from all DIMs — every event that crosses module boundaries must be defined here.
Event list = event name, producer module, payload schema, consumer module(s) (e.g., "user.created" from auth, consumed by backend for welcome email).
Delivery guarantees = at-least-once (most common) vs exactly-once (hard, usually not needed) — document per event.
Idempotency keys = how consumers handle duplicate events (idempotency key field in payload, dedup by event ID).
Common mistake: defining events without specifying the payload schema — consumers need exact type definitions to process events safely. -->
- Event list + payload schema: [TBD]
- Delivery guarantees (at-least-once/exactly-once): [TBD]
- Idempotency keys: [TBD]


<!-- AXION:SECTION:CONTRACT_SECURITY -->
## Security & Privacy Constraints
<!-- AGENT: Auth requirements per endpoint from BELS authorization rules — for each endpoint, specify: public, authenticated, or specific role/permission required.
PII fields = identify which fields in request/response schemas contain personally identifiable information, handling rules (encryption at rest, masking in logs, deletion on account removal).
Common mistake: marking all endpoints as "authenticated" without distinguishing permission levels — use the RBAC/permission model from the auth module. -->
- Auth requirements per endpoint: [TBD]
- PII fields + handling rules: [TBD]


<!-- AXION:SECTION:CONTRACT_ACCEPTANCE -->
## Acceptance Criteria
- [ ] All public endpoints enumerated
- [ ] Schema ownership is explicit
- [ ] Error and versioning rules documented


<!-- AXION:SECTION:CONTRACT_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
