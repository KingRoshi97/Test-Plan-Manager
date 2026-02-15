# Software Architecture Best Practices

## Architecture Patterns

### Monolith
- Single deployable unit containing all application logic
- Best for: small-to-medium teams, early-stage products, rapid iteration
- Structure: feature/module directories within single project
- Advantages: simple deployment, easy debugging, no network overhead between components
- Risks: tight coupling if boundaries aren't maintained, scaling is all-or-nothing
- Mitigation: enforce module boundaries, use internal interfaces between domains

### Modular Monolith
- Monolith with strict domain boundaries between modules
- Each module has: public API (interface), private implementation, own data store (or schema)
- Cross-module communication: through defined interfaces, not direct database access
- Prepare for extraction: modules can become services if needed later
- Best for: growing teams that want monolith simplicity with future flexibility

### Microservices
- Independent services, each owning a domain, deployed independently
- Best for: large organizations with multiple teams needing independent delivery
- Requirements: mature CI/CD, observability, service mesh, team autonomy
- Risks: distributed system complexity (network failures, data consistency, debugging)
- Don't adopt unless: team size > 20, deployment independence is critical, domain boundaries are clear

### Event-Driven Architecture
- Services communicate through events (publish/subscribe)
- Event types: domain events (OrderPlaced), integration events (UserCreated)
- Message brokers: Kafka, RabbitMQ, SQS, NATS
- Event sourcing: store sequence of events as source of truth (rebuild state from events)
- CQRS: separate read models from write models (optimize each independently)

### Serverless Architecture
- Functions as units of deployment (Lambda, Cloud Functions, Cloudflare Workers)
- Event-triggered: HTTP request, queue message, schedule, file upload
- Stateless: no in-function state, use external storage
- Best for: variable traffic, event-driven workloads, cost optimization
- Limitations: cold starts, execution time limits, vendor lock-in

## Domain Modeling

### Domain-Driven Design (DDD)
- Model software around business domain, not technical layers
- Ubiquitous language: same terms in code and business conversations
- Bounded contexts: distinct models for distinct areas (e.g., billing vs. shipping)
- Context mapping: define relationships between bounded contexts

### Aggregate Design
- Aggregate: cluster of entities that must be consistent together
- Aggregate root: entry point for all external interactions with the aggregate
- Rule: one transaction per aggregate (don't modify multiple aggregates in one transaction)
- Size: keep aggregates small (few entities, minimal data)

### Entity vs Value Object
- Entity: has identity, changes over time (User, Order)
- Value object: defined by attributes, immutable (Address, Money, DateRange)
- Prefer value objects where possible (simpler, no identity management)

### Domain Events
- Past-tense named facts: `OrderPlaced`, `PaymentReceived`, `UserRegistered`
- Immutable: events represent what happened, never modified after creation
- Carry necessary data: enough for consumers to act without querying back
- Schema versioned: backward-compatible evolution

### Service Boundaries
- Align with business capabilities (payments, inventory, user management)
- Own your data: each service has its own data store (no shared databases)
- Loose coupling: services communicate via APIs or events, not direct data access
- High cohesion: related functionality lives together in one service

## Data Architecture

### Schema Design
- Normalize for write-heavy workloads (avoid data duplication, maintain integrity)
- Denormalize for read-heavy workloads (pre-join data, optimize query performance)
- Hybrid: normalized source of truth + denormalized read replicas/caches
- Schema evolution: backward-compatible changes, migration strategy

### Data Consistency
- **Strong consistency**: ACID transactions for critical operations (payments, inventory)
- **Eventual consistency**: acceptable for read-heavy, non-critical data (analytics, feeds)
- **Saga pattern**: coordinate distributed transactions across services (compensation on failure)
- Consistency boundary = aggregate boundary (strong within, eventual across)

### Data Ownership
- Each service/module owns its data (authoritative source of truth)
- Other services read via API or event subscription (never direct database access)
- Shared databases are anti-pattern: couple services, prevent independent evolution
- Reference data: publish changes as events, consumers maintain local copies

### Caching Architecture
- Cache hierarchy: L1 (in-process) → L2 (distributed/Redis) → L3 (CDN)
- Cache-aside: application checks cache, falls back to database, populates cache
- Write-through: write to cache and database simultaneously
- Cache invalidation: time-based (TTL), event-based (on write), manual (admin action)
- Cache warming: pre-populate cache on startup or schedule

## API Architecture

### API Contracts
- Define contracts before implementation (schema-first or code-first with auto-generated schema)
- Use OpenAPI 3.1 for REST APIs, GraphQL SDL for GraphQL, proto files for gRPC
- Contracts are the interface between teams/services (stable, versioned, documented)
- Breaking changes require API version increment and migration plan

### API Gateway
- Single entry point for external traffic
- Responsibilities: routing, auth, rate limiting, request/response transformation
- Cross-cutting concerns: logging, metrics, tracing (applied at gateway level)
- Don't put business logic in the gateway (it's infrastructure)

### API Versioning Strategy
- URL path versioning (`/api/v1/`): simple, explicit, easy to route
- Maintain backward compatibility within a version
- Sunset old versions with timeline: announce → deprecation header → removal
- Support at most 2 concurrent API versions

### Inter-Service Communication
- Synchronous (HTTP/gRPC): for request-response patterns, when caller needs immediate answer
- Asynchronous (events/messages): for fire-and-forget, when eventual processing is acceptable
- Prefer async when: operations are slow, failures should be retried, order doesn't matter
- Prefer sync when: caller needs response to proceed, operation is fast and reliable

## Security Architecture

### Trust Boundaries
- Identify where trust changes: user ↔ frontend, frontend ↔ backend, backend ↔ database
- Validate and sanitize data at every trust boundary crossing
- Authentication at the edge (API gateway or load balancer)
- Authorization at the service level (each service enforces its own access rules)

### Threat Modeling
- Identify assets: data, services, infrastructure
- Identify threats: STRIDE framework (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation)
- Identify mitigations: controls for each threat
- Prioritize by risk: likelihood × impact
- Review: on architecture changes, new features, annually

### Zero Trust Networking
- Never trust network location (internal network is not inherently safe)
- Authenticate and authorize every request (service-to-service included)
- Encrypt all communication (mTLS for internal services)
- Least privilege access for all components

## Scalability Architecture

### Horizontal vs Vertical Scaling
- **Vertical**: increase resources of existing instance (simple, has limits)
- **Horizontal**: add more instances behind load balancer (complex, unlimited scale)
- Start vertical (simpler), switch to horizontal when hitting limits
- Design for horizontal from the start (stateless services, external sessions)

### Caching for Scale
- Cache computed results to reduce computation (memoization)
- Cache database queries to reduce database load
- CDN for static assets and cacheable API responses
- Cache hierarchy: local → distributed → origin

### Queue-Based Architecture
- Decouple producers from consumers (queue absorbs load spikes)
- Worker pools process queue at steady rate
- Priority queues for urgent vs. background work
- Dead letter queue for failed messages (retry or manual review)

### Database Scaling
- Read replicas: distribute read load across multiple database instances
- Sharding: distribute data across multiple database instances (by tenant, region, key range)
- Connection pooling: reduce database connection overhead
- Query optimization: indexes, query plans, denormalization for hot paths

### Load Patterns
- Stateless services: easy to scale horizontally (no session affinity needed)
- Stateful services: require careful scaling (sticky sessions, data partitioning)
- Event-driven: scale consumers based on event volume
- Batch: scale workers for processing windows, scale down when idle

## Reliability Architecture

### Redundancy
- No single points of failure: every component has at least one redundant instance
- Multi-AZ deployment for all production services
- Database: primary + standby with automatic failover
- Load balancer: distribute traffic, health-check-based routing

### Resilience Patterns
- **Circuit breaker**: stop calling failing dependency, allow recovery
- **Bulkhead**: isolate failures to subsystem (separate resource pools)
- **Retry with backoff**: retry transient failures with increasing delays
- **Timeout**: bound all external calls, fail fast on timeout
- **Fallback**: degrade gracefully when dependency unavailable

### Graceful Degradation
- Define feature tiers: critical (must work), important (should work), nice-to-have (can degrade)
- When dependencies fail: hide non-critical features, show cached data, explain to user
- Stale data is better than no data (show with "last updated" timestamp)
- Circuit breakers prevent cascading failures across services

## Cross-Cutting Concerns

### Observability
- Logging: structured, correlated, centralized
- Metrics: request rate, error rate, latency (RED method)
- Tracing: distributed traces across service boundaries
- Dashboards: per-service, per-team, executive summary
- Alerting: symptom-based, actionable, with runbook links

### Configuration Management
- External configuration: environment variables, config files, feature flags
- Configuration hierarchy: defaults → environment-specific → instance-specific
- Runtime configuration: change behavior without redeployment
- Validation: verify configuration on startup, fail fast on invalid

### Logging Architecture
- Structured JSON format with consistent fields
- Correlation ID: propagated across all services in a request chain
- Log levels: ERROR, WARN, INFO, DEBUG (DEBUG off in production)
- Centralized aggregation: stdout → collector → storage → query UI
- Retention: 30 days hot, 90 days warm, 1 year cold

## Architecture Decision Records (ADRs)

### ADR Format
- **Title**: short, descriptive name for the decision
- **Status**: proposed, accepted, deprecated, superseded
- **Context**: why this decision needs to be made, what constraints exist
- **Decision**: what was decided and why
- **Consequences**: what trade-offs result from this decision

### When to Write ADRs
- Significant technology choices (database, framework, language)
- Architecture patterns (monolith vs. microservices, sync vs. async)
- Breaking changes to existing architecture
- Security and compliance decisions
- Trade-off decisions with lasting impact

### ADR Practices
- Store in version control alongside code
- Number sequentially: `001-use-postgresql.md`, `002-adopt-event-driven.md`
- Never delete: supersede with new ADR (maintain history)
- Review in architecture meetings
- Reference in code comments where the decision is implemented

## Solutions Architecture

### Integration Patterns
- **API integration**: REST/GraphQL for request-response (most common)
- **Event integration**: pub/sub for async, decoupled systems
- **File integration**: batch files for legacy system integration (SFTP, S3)
- **Database integration**: shared database (anti-pattern, use only as last resort)

### Migration Strategies
- **Strangler fig**: incrementally replace legacy system (route traffic to new system piece by piece)
- **Big bang**: replace entire system at once (high risk, sometimes necessary)
- **Parallel run**: run old and new systems simultaneously, compare outputs
- **Feature parity migration**: migrate feature by feature, validate each one

### Vendor Integration
- Wrap vendor APIs in internal service (adapter pattern)
- Don't leak vendor concepts into domain model
- Plan for vendor switch: abstract integration behind clean interface
- Evaluate: reliability, support, pricing, exit strategy before committing

## Technical Design

### Design Document Format
- Problem statement and goals
- Proposed solution with architecture diagram
- Alternative solutions considered and why rejected
- Data model and API design
- Security and privacy considerations
- Performance and scalability considerations
- Testing strategy
- Rollout plan (phased deployment, feature flags, rollback)
- Open questions and risks

### Component Design
- Single responsibility: each component does one thing well
- Interface-driven: define public interface before implementation
- Dependency injection: components receive dependencies, don't create them
- Testability: components can be tested in isolation with mocked dependencies

### Failure Mode Analysis
- For each component: what happens when it fails?
- For each dependency: what happens when it's unavailable?
- Define recovery strategy: retry, fallback, fail-fast, circuit break
- Document in operational runbook

### Operational Readiness
- Monitoring: dashboards and alerts configured before launch
- Runbooks: documented procedures for common issues
- On-call: team aware and prepared for incidents
- Rollback: procedure tested and documented
- Capacity: verified to handle expected load with headroom
