# Backend Development Best Practices

## API Design

### REST API Fundamentals
- Use plural nouns for resources: `/api/users`, `/api/orders`
- HTTP methods map to CRUD: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- Status codes: 200 (OK), 201 (created), 204 (no content), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limited), 500 (server error)
- Standard error envelope: `{ error: { code, message, details } }`
- Pagination: cursor-based for large datasets, offset for small/static

### GraphQL API Design
- Schema-first or code-first with strong typing (Pothos, TypeGraphQL)
- Queries for reads, mutations for writes, subscriptions for real-time
- Pagination: Relay-style connections (edges/nodes/pageInfo)
- Depth limiting and query complexity analysis to prevent abuse
- Batch and cache with DataLoader to prevent N+1 queries
- Document resolvers with descriptions in the schema

### gRPC / Service APIs
- Define contracts with Protocol Buffers (protobuf)
- Use for internal service-to-service communication (not client-facing)
- Streaming: server-streaming, client-streaming, bidirectional
- Version services via package namespacing
- Generate client/server stubs from proto definitions

### Idempotency
- All write endpoints should support idempotency keys (header: `Idempotency-Key`)
- Store request hash + response for idempotency window (24-48 hours)
- Return cached response for duplicate requests with same key
- Critical for payment processing, resource creation, any non-reversible action

### API Documentation
- OpenAPI 3.1 spec auto-generated from code (Zod → OpenAPI, decorators → Swagger)
- Interactive documentation (Swagger UI, Redoc) served at `/api/docs`
- Include request/response examples for all endpoints
- Document authentication requirements, rate limits, and error codes
- Keep documentation in sync with code (fail CI if spec is outdated)

### API Versioning
- URL path versioning (`/api/v1/`) for simplicity and explicitness
- Maintain backward compatibility within a version
- Deprecation process: announce → add Sunset header → remove after grace period
- Support at most 2 concurrent versions (current + previous)

## Business Logic

### Domain Modeling
- Model business entities as distinct objects (User, Order, Product, Subscription)
- Define invariants: rules that must always be true (order total = sum of line items)
- Use aggregates: cluster entities that must be consistent together (Order + OrderItems)
- Separate domain logic from infrastructure (pure functions, no database calls in domain layer)

### Service Layer
- Services orchestrate domain operations: `OrderService.placeOrder()`
- Keep services thin — delegate complex logic to domain objects
- One service per bounded context (Auth, Orders, Billing, Notifications)
- Services are the API layer's interface to business logic
- Never call one service from another — use events or a higher-level orchestrator

### Workflow and State Machine Logic
- Model multi-step processes as explicit state machines (Order: draft → confirmed → shipped → delivered)
- Define valid transitions and guard conditions (can't ship if not confirmed)
- Use events to trigger side effects on transitions (send email on confirmation)
- Persist current state in database, validate transitions before applying
- Handle edge cases: expired workflows, concurrent transitions, rollback

### Background Jobs
- Use for: email sending, report generation, data export, image processing, cleanup
- Job queue: BullMQ (Redis-backed), or database-backed for simpler needs
- Make jobs idempotent (safe to retry on failure)
- Set timeouts and max retry counts per job type
- Monitor: queue depth, processing time, failure rate
- Dead letter queue for permanently failed jobs (manual review)

### Event-Driven Patterns
- Publish domain events when state changes: `OrderPlaced`, `PaymentReceived`
- Subscribers handle side effects: send notifications, update analytics, trigger workflows
- Events should be immutable facts about what happened (past tense naming)
- At-least-once delivery: make event handlers idempotent
- Event schema versioning for backward compatibility

### Caching Strategy
- **What to cache**: expensive queries, frequently-read/rarely-written data, external API responses
- **Where**: in-memory (single process), Redis (distributed), CDN (static assets)
- **TTL**: seconds for real-time data, minutes for dashboard data, hours for configuration
- Cache invalidation: time-based (TTL), event-based (invalidate on write), manual (admin purge)
- Cache-aside pattern: read cache first, fetch from source on miss, populate cache

### Concurrency Control
- Optimistic concurrency: version column, check version on update, retry on conflict
- Pessimistic locking: `SELECT FOR UPDATE` when conflicts are frequent
- Distributed locks: Redis-based (Redlock) for cross-process coordination
- Advisory locks for batch operations (prevent concurrent runs of same job)

### Audit Logging
- Log who did what, when, and to what resource
- Store: actor (user ID), action (create/update/delete), resource (type + ID), timestamp, diff
- Immutable audit log (append-only, never delete or modify)
- Separate from application logs (audit is a business requirement, not debugging)
- Searchable by actor, resource, time range

### Multi-Tenant Logic
- Tenant isolation: row-level (tenant_id column), schema-level, or database-level
- Every query must filter by tenant (middleware or ORM default scope)
- Cross-tenant data access is never accidental (explicit admin override required)
- Tenant-specific configuration (features, limits, branding)

## Auth and Permissions

### Authentication Methods
- **Session-based**: httpOnly secure cookies, server-side session store (Redis/DB)
- **JWT**: short-lived access tokens (15-30 min), secure refresh tokens (7-30 days)
- **OAuth/OIDC**: for third-party login (Google, GitHub) — use PKCE for SPAs
- **API keys**: for service-to-service or developer integrations (scoped, rotatable)

### Password Security
- Hash with bcrypt (cost 12+) or Argon2id
- No maximum length, no complexity rules (NIST guidance), minimum 8 characters
- Never store, log, or return passwords in any form
- Account lockout after 5-10 failed attempts (exponential backoff, not permanent lock)
- Password reset via time-limited, single-use token sent to verified email

### Session Management
- Regenerate session ID after login (prevent session fixation)
- Idle timeout: 15-30 minutes for sensitive apps, 24 hours for standard apps
- Absolute timeout: force re-auth after 8-24 hours regardless of activity
- Secure logout: invalidate session server-side, clear cookies
- Support concurrent session management (show active sessions, revoke remotely)

### 2FA / Step-Up Authentication
- TOTP (time-based one-time password) as default 2FA method
- SMS as fallback only (vulnerable to SIM swap)
- Require 2FA for sensitive actions (password change, payment, admin actions)
- Provide backup codes for account recovery
- Remember trusted devices (optional, with user consent)

### Authorization Models
- **RBAC**: roles (admin, editor, viewer) with associated permissions
- **ABAC**: attribute-based rules (owner can edit, anyone can view if published)
- **Capability-based**: fine-grained permissions (canCreate, canEdit, canDelete, canAdmin)
- Check authorization at API layer (not just UI) — backend is source of truth
- Deny by default: explicitly grant permissions, never assume access

### Permission Enforcement
- Middleware for route-level authorization (role checks, authentication verification)
- Resource-level checks in service layer (ownership, team membership)
- Never trust client-provided user role or permission claims
- Log authorization failures (potential security incidents)
- Return 403 (forbidden) not 404 for unauthorized access (unless resource existence is sensitive)

## Reliability and Operations

### Health Checks
- `GET /health` returns 200 when service is ready to handle requests
- Check: database connectivity, cache availability, critical dependency reachability
- Return 503 during startup/shutdown for load balancer draining
- Include version/commit hash for deployment verification

### Structured Logging
- JSON format with consistent fields: timestamp, level, message, request_id, user_id
- Correlation IDs: generate per request, propagate across services
- Log levels: ERROR (action needed), WARN (investigate), INFO (audit), DEBUG (dev only)
- Never log: passwords, tokens, PII, credit cards, API keys

### Metrics and Monitoring
- Track: request rate, error rate, response time (p50/p95/p99), queue depth
- Track: database query duration, connection pool usage, external API latency
- Dashboard for key metrics with alerting on anomalies
- Alert thresholds: error rate > 1%, p95 > 2x baseline, connection pool > 80%

### Graceful Shutdown
- Handle SIGTERM: stop accepting new requests, finish in-flight requests
- Set drain timeout (30 seconds) — force-kill after timeout
- Close database connections and cache connections cleanly
- Deregister from service discovery / load balancer before draining

### Retry and Circuit Breaker
- Retry transient failures with exponential backoff (1s, 2s, 4s, max 30s)
- Circuit breaker: open after N consecutive failures, half-open after timeout, close on success
- Don't retry non-transient errors (400, 401, 403, 404)
- Set request timeouts on all outbound calls (5s for fast services, 30s for slow)

## Backend Security

### Input Validation
- Validate all input server-side (never trust client-only validation)
- Use Zod or similar for structured validation with clear error messages
- Sanitize strings: trim whitespace, normalize unicode
- Reject unexpected fields (strict mode) to catch injection attempts

### Injection Prevention
- Use parameterized queries / ORM (never string-concatenate SQL)
- Validate and sanitize dynamic identifiers (table/column names)
- NoSQL injection: validate query operators, don't pass raw user input to queries
- Command injection: never pass user input to shell commands

### Secrets Management
- Never commit secrets to version control
- Use environment variables or secrets manager (Replit Secrets, AWS SSM, Vault)
- Rotate secrets on schedule (90 days for API keys, annually for signing keys)
- Different secrets per environment (dev/staging/production)

### Secure File Uploads
- Validate file type by magic bytes (not just extension or MIME type)
- Set maximum file size limits (configurable per endpoint)
- Store uploads outside web root or in object storage (S3, R2)
- Generate random filenames (never use user-provided names)
- Scan for malware on public upload endpoints
- Serve user uploads from separate domain/subdomain

## Performance and Scalability

### Horizontal Scaling
- Keep application stateless (sessions in Redis/DB, not in memory)
- Use load balancer with health checks and sticky sessions only if needed
- Design for eventual consistency where possible
- Shard data by tenant or region for large-scale systems

### Queue-Based Workload Smoothing
- Use queues to decouple producers from consumers (API → Queue → Worker)
- Smooth traffic spikes (queue absorbs burst, workers process at steady rate)
- Priority queues for urgent vs. background work
- Dead letter queue for failed messages (inspect and retry manually)

### N+1 Prevention
- Use JOINs or eager loading for related data
- Batch queries: `WHERE id IN (...)` instead of individual lookups
- DataLoader pattern for GraphQL resolvers
- Monitor and alert on query count per request

### Connection Pooling
- Pool database connections (10-20 per process, adjust based on load)
- Pool HTTP connections for external API calls (keep-alive)
- Set connection and query timeouts
- Monitor pool usage and increase size before saturation

## Integrations

### Third-Party API Patterns
- Use typed HTTP clients with request/response validation
- Handle rate limits (respect Retry-After header, implement backoff)
- Timeout all external calls (5-30 seconds depending on service)
- Circuit breaker for degraded external services
- Cache responses where freshness allows (reduce API call volume)

### Webhook Consumers
- Verify webhook signatures (HMAC-SHA256 with shared secret)
- Deduplicate events (store event ID, skip if already processed)
- Respond 200 quickly, process asynchronously (queue for processing)
- Handle out-of-order events gracefully
- Log all received webhooks for debugging

### Payment Integration
- Never store raw credit card data (use payment processor tokenization)
- Implement idempotency for all payment operations
- Handle webhook events for payment lifecycle (succeeded, failed, refunded)
- Test with sandbox/test mode before production
- Log payment events to audit trail (redact sensitive fields)

## Backend Testing

### Unit Tests
- Test domain logic and business rules as pure functions
- Test service methods with mocked dependencies
- Test validation schemas with valid and invalid inputs
- Test error handling and edge cases

### Integration Tests
- Test API endpoints end-to-end (request → service → database → response)
- Use test database (separate from development)
- Reset database state between tests
- Test authentication and authorization flows
- Test error responses (400, 401, 403, 404, 500)

### Contract Tests
- Validate API responses against OpenAPI schema
- Test request validation matches documented schema
- Run contract tests in CI to prevent API drift
- Share schemas between frontend and backend for consistency

## Developer Experience

### Local Development
- One-command setup: `npm run dev` starts everything needed
- Seed data for development (realistic shapes, not `test123`)
- Mock external services for offline development
- Hot reload for code changes

### Code Organization
- Feature-based structure: `features/auth/`, `features/orders/`
- Or layer-based: `routes/`, `services/`, `repositories/`
- Shared utilities in `lib/` or `utils/`
- Configuration in `config/` with environment-aware loading
- Consistent file naming: kebab-case for files, PascalCase for classes
