# Full-Stack Integration Best Practices

## Frontend + Backend Coordination

### End-to-End Feature Implementation
- Plan features as vertical slices: UI → API → Business Logic → Database
- Implement API contract first (types/schemas), then build backend and frontend in parallel
- Use shared TypeScript types between frontend and backend (shared schema package)
- Validate inputs identically on both sides (same Zod schemas)
- Test the full flow end-to-end before considering a feature complete

### Shared Domain Understanding
- Domain terminology must be consistent across layers (same entity names, same field names)
- If backend calls it `line_items`, frontend should call it `lineItems` (case conversion only)
- Business rules encoded in shared constants or configuration (not duplicated ad-hoc)
- Data shapes should be documented in a shared schema (Zod + Drizzle types)

### UI State + Server State Coordination
- Server state: managed by TanStack Query (or equivalent) — never duplicate in Zustand/Redux
- UI state: managed locally or in a client store (theme, sidebar open, selected tab)
- Never mix: don't store API data in client store, don't send UI state to server
- Sync points: mutations invalidate server cache, optimistic updates apply to query cache

### API Contract Alignment
- Define request/response schemas using Zod in shared module
- Frontend and backend import the same schema types
- Changes to schema types immediately surface type errors on both sides
- Version APIs when breaking changes are unavoidable
- Document all endpoints, parameters, and response shapes

### Form Flows and Backend Validation
- Client-side validation for instant UX feedback (field-level, on blur)
- Server-side validation as the authoritative check (never trust client alone)
- Map server validation errors to form fields (match field names in error response)
- Handle server errors inline (same UI as client validation errors)
- Multi-step forms: validate each step client-side, validate all data server-side on final submit

### Auth-Aware UI and Backend Alignment
- Backend enforces authentication and authorization on every request
- Frontend reflects auth state: show/hide features, redirect unauthorized users
- Never rely on UI-only auth gating (always enforce server-side)
- Consistent session handling: login redirects, token refresh, logout cleanup
- Permission-aware UI: disable/hide actions the user can't perform (but always check server-side)

### Error Handling Consistency
- Define error codes in a shared module (SCREAMING_SNAKE_CASE constants)
- Backend returns structured errors: `{ error: { code, message, details } }`
- Frontend maps error codes to user-friendly messages
- Use error code (not message) for programmatic handling (retry, redirect, show specific UI)
- Consistent HTTP status codes: 400 for validation, 401 for auth, 403 for permission, 404 for not found

## System Integration

### Third-Party Service Integration
- Backend is the integration point for external services (never call third-party APIs from frontend)
- Wrap external APIs in service modules with retry, circuit breaker, and logging
- Handle credential rotation without downtime (config-driven, not hardcoded)
- Mock external services in development and test environments
- Monitor external API health and latency separately from internal metrics

### Data Synchronization
- Define source of truth for each data entity (usually the backend/database)
- Frontend caches server data but always defers to server on conflict
- WebSocket/SSE for real-time sync (chat, notifications, collaborative editing)
- Polling for near-real-time when WebSocket is not justified (every 30-60s)
- Conflict resolution: last-write-wins for simple cases, merge for collaborative

### Webhook Production and Consumption
- Outbound webhooks: sign payloads (HMAC-SHA256), retry with backoff, allow event filtering
- Inbound webhooks: verify signatures, deduplicate events, respond quickly, process async
- Document webhook event schemas for consumers
- Test with webhook testing tools (ngrok, webhook.site)

### Background Jobs + UI Status
- API queues job → returns job ID to frontend
- Frontend polls job status or subscribes to WebSocket for progress updates
- Show progress in UI: percentage, current step, estimated time remaining
- Handle job failure: show error with retry option, don't leave UI in indeterminate state

### Real-Time Integration
- WebSocket for bidirectional real-time (chat, live updates, presence)
- Server-Sent Events (SSE) for server-to-client streaming (notifications, feed updates)
- Implement reconnection with exponential backoff
- Handle message ordering and deduplication
- Authenticate WebSocket connections (token in handshake or first message)

### File Upload Pipeline
- Frontend: select files → validate type/size → upload with progress indicator
- Backend: receive upload → validate (magic bytes, size) → store in object storage → return URL
- Handle multipart uploads for large files (chunked upload with resume)
- Clean up orphaned uploads (uploaded but never attached to a resource)
- Serve files from CDN or separate domain for performance and security

### Environment Configuration
- Consistent env var naming across layers: `DATABASE_URL`, `API_URL`, `SESSION_SECRET`
- Frontend env vars: prefixed (`VITE_`, `NEXT_PUBLIC_`) and non-sensitive only
- Environment parity: dev/staging/production should differ only in configuration, not behavior
- Validate all required env vars on startup (fail immediately if missing)
- Document all env vars with descriptions and example values

## Feature Ownership

### Feature Lifecycle
- Spec → Design → Plan → Implement → Test → Ship → Monitor → Maintain
- Owner is responsible for the feature across all layers (frontend, backend, database)
- Write technical design document for complex features before implementation
- Post-implementation: add monitoring, documentation, and runbook entries

### Testing Across Layers
- Unit tests: domain logic (backend), component logic (frontend)
- Integration tests: API endpoints, database queries, external service mocking
- E2E tests: critical user journeys through real UI against real backend
- Performance tests: load testing for high-traffic endpoints

### Monitoring and Alerting
- Set up per-feature monitoring: success rate, latency, error rate
- Define SLIs for the feature (e.g., checkout success rate > 99.5%)
- Alert on degradation before users notice
- Include feature dashboards in operational review

### Bug Triage and Iteration
- Categorize bugs: frontend, backend, integration, data
- Prioritize by impact: P0 (down), P1 (degraded), P2 (inconvenience), P3 (cosmetic)
- Fix P0/P1 immediately, schedule P2/P3 in next sprint
- Post-fix: add regression test, update documentation

## Architecture and Boundary Decisions

### Where Logic Belongs
- **Frontend**: UI state, form validation (for UX), display formatting, user preferences
- **Backend**: business rules, authorization, data validation (for security), external integrations
- **Shared**: data schemas, validation rules, constants, enums
- **Never frontend-only**: authorization checks, price calculations, feature gating logic

### Shared Types and Contracts
- Define in `shared/schema.ts` or equivalent shared package
- Use Zod for schemas that work as both TypeScript types and runtime validators
- Generate API client types from OpenAPI spec or shared schemas
- Changes to shared types trigger type-checking across both layers in CI

### Architecture Patterns
- **Monolith**: default for most projects (simpler, faster to develop)
- **Modular monolith**: when you need domain isolation but not separate deployments
- **Microservices**: only when teams need independent deployment cycles (high coordination cost)
- Start monolith, extract services only when complexity demands it

### Designing for Extensibility
- Use configuration over hardcoding (feature flags, settings, templates)
- Design APIs with forward compatibility (add fields, never remove)
- Plugin architecture for user-extensible features
- Document extension points and customization options

## DevOps Awareness

### Deployment Coordination
- Frontend and backend deployments may be independent (CDN for frontend, server for backend)
- API versioning ensures frontend changes don't break if deployed before backend (and vice versa)
- Database migrations run before code deployment (backward-compatible migrations)
- Feature flags for safe rollout (deploy code dark, enable incrementally)

### Feature Flags
- Use for: gradual rollout, A/B testing, kill switches for risky features
- Evaluate flags server-side (backend controls feature access)
- Frontend reads flag state from API or config endpoint
- Clean up flags after full rollout (remove conditional code)

### Backward Compatibility
- API: new fields are optional, old clients should continue to work
- Database: add columns as nullable or with defaults (don't break existing code)
- Frontend: handle both old and new API response shapes during migration
- Coordinate breaking changes: deprecation warning → migration period → removal

## Security Ownership

### End-to-End Secure Data Handling
- Sensitive data encrypted in transit (HTTPS everywhere) and at rest (database encryption)
- PII minimization: don't collect or store data you don't need
- Data classification: public, internal, confidential, restricted
- Access control at every layer: UI hides, API enforces, database constrains

### AuthN/AuthZ Correctness
- Authentication checked on every API request (middleware, not per-route)
- Authorization checked at service layer (resource ownership, role permissions)
- Frontend reflects backend auth state (never shows features user can't access)
- Session management: secure cookies, timeout, refresh, revocation

### Preventing Data Leaks
- API responses never include data the user shouldn't see (filter at query level)
- GraphQL: field-level authorization, don't expose entire schema
- Error messages don't reveal internal state (no stack traces, SQL queries, or internal IDs)
- Logs redact PII and sensitive data

## Product and UX Alignment

### Translating Requirements to Flows
- Product requirement → user journey → screen wireframes → API design → implementation
- Identify edge cases early: empty states, error states, permission boundaries
- Consider mobile/responsive from the start (not as an afterthought)
- Prototype complex interactions before full implementation

### Tradeoff Management
- Speed vs. quality: define "good enough" for first release, iterate from there
- UX ideals vs. engineering constraints: communicate tradeoffs to stakeholders
- Performance vs. features: set performance budgets, measure impact of new features
- Document decisions and rationale (Architecture Decision Records)

## Maintenance and Tech Debt

### Refactoring Strategy
- Refactor incrementally (boy scout rule: leave code better than you found it)
- Use feature boundaries for safe refactoring (change inside a module without affecting others)
- Type system helps: refactor types first, then fix all resulting type errors
- Avoid big-bang rewrites (high risk, unclear completion timeline)

### Dependency Management
- Update dependencies on a regular schedule (weekly for patch, monthly for minor)
- Review changelogs before updating (breaking changes, deprecations)
- Keep lockfile committed (reproducible installs)
- Remove unused dependencies (dead code elimination extends to packages)

### Documentation Currency
- Update API docs when endpoints change (automate from code where possible)
- Update architecture docs when system structure changes
- Update README for new setup requirements or changed workflows
- Review docs as part of PR review (code change → doc change)
