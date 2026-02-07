<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:backend -->
<!-- AXION:PREFIX:be -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# Backend — AXION Module Template (Blank State)

**Module slug:** `backend`  
**Prefix:** `be`  
**Description:** Server-side logic, APIs, and business rules

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
- Non-Functional Profile implications: UNKNOWN (source: RPBS §7 Non-Functional Profile)
- Enabled capabilities in scope for this module (mark Yes/No/N/A):
  - Billing/Entitlements: N/A (source: RPBS §14)
  - Notifications: N/A (source: RPBS §11)
  - Uploads/Media: N/A (source: RPBS §13)
  - Public API: N/A (source: RPBS §22)
- Privacy Controls (Deletion/Export): UNKNOWN (source: RPBS §29)
- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)
- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)

<!-- AXION:SECTION:BE_SCOPE -->
## Scope & Ownership
<!-- AGENT: Derive from domain-map.md boundaries for the backend module.
"Owns" = API route handlers, server-side business logic, service orchestration, job execution.
"Does NOT own" = database schema (database module), API contract types (contracts module), auth logic (auth module), UI (frontend module).
Common mistake: claiming ownership of database migrations or shared type definitions — those belong to database and contracts respectively. -->
- Owns: [TBD]
- Does NOT own: [TBD]


<!-- AXION:SECTION:BE_API -->
## API Endpoints & Handlers
<!-- AGENT: Reference contracts module DIM for the canonical endpoint list — do NOT redefine endpoints here.
Link to the DIM exposed interfaces section. For each endpoint, describe handler responsibility: input parsing, service call, response mapping.
Handler responsibilities = what the handler does beyond routing (validation delegation, auth check delegation, error mapping).
Common mistake: duplicating the endpoint definitions from contracts — backend describes implementation behavior, contracts owns the interface shape. -->
- Endpoint inventory link (from contracts): [LINK]
- Handler responsibilities: [TBD]


<!-- AXION:SECTION:BE_DOMAIN -->
## Domain Logic & Rules
<!-- AGENT: Copy business rules from BELS for this domain — every rule should trace back to a BELS entry.
Validation rules = server-side enforcement of BELS constraints (field formats, range checks, cross-field rules).
State machines = entity lifecycle states and valid transitions (e.g., Order: draft→submitted→fulfilled→cancelled), reference BELS state rules.
Common mistake: inventing business rules not in BELS, or only implementing frontend validation without server-side enforcement. -->
- Core business rules: [TBD]
- Validation rules: [TBD]
- State machines/workflows: [TBD]


<!-- AXION:SECTION:BE_JOBS -->
## Async Jobs & Queues
<!-- AGENT: Derive from RPBS §28 Scheduled & Background Tasks.
Job list = each background job (name, trigger: cron/event/manual, what it does, expected duration).
Retry/backoff/DLQ = max retries, backoff strategy (exponential with jitter), dead letter queue handling, alerting on repeated failures.
Common mistake: forgetting idempotency — every job must be safe to retry without side effects. -->
- Job list + triggers: [TBD]
- Retry/backoff/dlq rules: [TBD]


<!-- AXION:SECTION:BE_CACHING -->
## Caching Strategy
<!-- AGENT: Based on RPBS §7 performance requirements — identify which data needs caching to meet latency targets.
Cache layers = in-memory (per-process), distributed (Redis), CDN, HTTP cache headers — specify which layer for which data.
Invalidation rules = TTL values, event-driven invalidation (e.g., cache busts on entity update), cache-aside vs write-through patterns.
Common mistake: caching without invalidation strategy leads to stale data — always pair cache with explicit invalidation rules. -->
- Cache layers: [TBD]
- Invalidation rules: [TBD]


<!-- AXION:SECTION:BE_INTEGRATION -->
## Integration Points
<!-- AGENT: Derive from RPBS §9 Integrations — list every external service the backend communicates with.
External services = payment providers, email/SMS, storage, third-party APIs — for each: purpose, auth method, rate limits.
Idempotency = how to prevent duplicate operations on retries (idempotency keys, dedup logic).
Webhook verification = signature validation, replay protection, ordering guarantees.
Common mistake: not documenting failure modes — what happens when each integration is down? -->
- External services touched: [TBD]
- Idempotency and webhook verification: [TBD]


<!-- AXION:SECTION:BE_OBSERVABILITY -->
## Observability
<!-- AGENT: Structured logging fields = mandatory fields on every log line (requestId, userId, action, duration, statusCode).
Metrics = request rate, error rate, latency percentiles (p50/p95/p99), queue depths, cache hit rates.
Tracing = distributed trace propagation (trace ID headers), span naming conventions, which operations get their own spans.
Common mistake: logging PII in plain text — ensure sensitive fields are redacted or omitted from logs. -->
- Structured logging fields: [TBD]
- Metrics + tracing: [TBD]


<!-- AXION:SECTION:BE_RELIABILITY -->
## Reliability & Resilience
<!-- AGENT: Derive from RPBS §7 reliability requirements (uptime targets, SLOs).
Timeouts = per-dependency timeout values, overall request timeout budget.
Retries = which operations are retryable (idempotent ones only), max retry count, backoff strategy.
Circuit breakers = thresholds for opening (error rate/count), half-open probe strategy, fallback behavior.
Graceful degradation = what the system does when a dependency is down (serve cached data, disable feature, return partial response).
Common mistake: retrying non-idempotent operations — only retry safe, idempotent calls. -->
- Timeouts/retries/circuit breakers: [TBD]
- Graceful degradation: [TBD]


<!-- AXION:SECTION:BE_SECURITY -->
## Backend Security
<!-- AGENT: Input validation = reference BELS validation rules for every endpoint input, use schema validation (Zod/Joi), SQL injection prevention (parameterized queries), NoSQL injection guards.
Secrets management = how secrets are stored (env vars, vault), rotation policy, which secrets exist (DB credentials, API keys, signing keys).
Common mistake: trusting client-side validation alone — server must independently validate all inputs against BELS rules. -->
- Input validation/injection defenses: [TBD]
- Secrets management expectations: [TBD]


<!-- AXION:SECTION:BE_ACCEPTANCE -->
## Acceptance Criteria
- [ ] Business rules enumerated
- [ ] Failure handling documented
- [ ] Observability requirements defined


<!-- AXION:SECTION:BE_OPEN_QUESTIONS -->
## Open Questions
- [TBD]
