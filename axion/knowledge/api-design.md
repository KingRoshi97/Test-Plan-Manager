# API Design Best Practices

## REST Conventions

### URL Structure
- Use plural nouns for resources: `/api/users`, `/api/orders`
- Nest for relationships: `/api/users/:id/orders`
- Maximum nesting depth: 2 levels (deeper = use query params or separate endpoint)
- Use kebab-case for multi-word resources: `/api/order-items`
- Version in URL path: `/api/v1/users` (simpler) or Accept header (more correct)

### HTTP Methods
| Method | Purpose | Idempotent | Request Body |
|--------|---------|------------|--------------|
| GET | Retrieve resource(s) | Yes | No |
| POST | Create resource | No | Yes |
| PUT | Replace entire resource | Yes | Yes |
| PATCH | Partial update | No | Yes |
| DELETE | Remove resource | Yes | Optional |

### Status Codes
| Code | When to Use |
|------|-------------|
| 200 | Successful GET, PUT, PATCH, DELETE |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE with no body |
| 400 | Validation error, malformed request |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Semantically invalid (valid JSON but bad values) |
| 429 | Rate limit exceeded |
| 500 | Server error (never expose internal details) |

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable description",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

### Pagination
- Use cursor-based pagination for large/dynamic datasets
- Use offset-based for small/static datasets
- Response envelope:
```json
{
  "data": [],
  "pagination": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "next_cursor": "eyJpZCI6MTJ9"
  }
}
```
- Default page size: 20, max: 100
- Include total count only if query is cheap (otherwise omit)

### Filtering, Sorting, Searching
- Filtering: `?status=active&type=premium`
- Sorting: `?sort=created_at&order=desc` (or `?sort=-created_at`)
- Searching: `?q=search+term` for full-text, `?name=john` for exact field match
- Date ranges: `?created_after=2024-01-01&created_before=2024-12-31`

## Request/Response Patterns

### Consistent Envelope
- Success: `{ "data": ... }` or `{ "data": [...], "pagination": {...} }`
- Error: `{ "error": { "code": "...", "message": "..." } }`
- Never mix top-level data and error fields

### Field Naming
- Use camelCase in JSON (matches JavaScript conventions)
- Use snake_case in database columns (matches SQL conventions)
- ORM handles the mapping between the two
- Dates: ISO 8601 format (`2024-01-15T10:30:00Z`)
- Money: Integer cents, not floating point (`{ "amount": 1999, "currency": "USD" }`)

### Partial Updates (PATCH)
- Only include fields being changed in the request body
- Null means "set to null", absent means "don't change"
- Return the full updated resource in the response

## API Versioning

### Strategies
- **URL path versioning** (recommended): `/api/v1/users` — Simple, explicit, easy to route
- **Header versioning**: `Accept: application/vnd.api+json;version=2` — Cleaner URLs, harder to test
- **Query parameter**: `?version=2` — Easy to implement, not RESTful

### Deprecation Process
1. Announce deprecation with timeline (minimum 6 months for public APIs)
2. Add `Deprecation` header to responses: `Deprecation: true`
3. Add `Sunset` header with removal date: `Sunset: Sat, 01 Jun 2025 00:00:00 GMT`
4. Log usage of deprecated endpoints to track migration progress
5. Return `410 Gone` after sunset date

## Validation

### Request Validation
- Validate all inputs server-side (client validation is for UX only)
- Use Zod schemas shared between frontend and backend
- Reject unknown fields (strict mode) to catch typos
- Validate string lengths, number ranges, enum values, date ranges
- Sanitize strings: trim whitespace, normalize unicode

### Response Validation
- Validate outgoing responses in development/staging (catch data leaks)
- Never expose internal IDs, database errors, or stack traces to clients
- Strip sensitive fields (password hashes, internal notes) from responses

## Idempotency

### Idempotency Keys for Write Endpoints
- Accept `Idempotency-Key` header on POST/PATCH requests
- Store the key + response for a retention window (24-48 hours)
- On duplicate key, return the original response without re-executing the operation
- Use UUIDv4 for idempotency keys (client-generated)
- Required for payment endpoints, critical writes, and any operation with side effects

### Implementation Pattern
```
1. Client generates Idempotency-Key (UUIDv4)
2. Server checks if key exists in idempotency store
3. If exists: return stored response (200 with original body)
4. If not: execute operation, store key + response, return result
5. Keys expire after 24-48 hours
```

### Retry Safety
- GET, PUT, DELETE are inherently idempotent — no key needed
- POST and PATCH need idempotency keys for safe retries
- Document which endpoints support idempotency keys

## GraphQL API Design

### Schema Design
- Use a schema-first or code-first approach consistently (code-first recommended for TypeScript)
- Define clear types for all entities — avoid generic `JSON` scalar
- Use input types for mutations: `input CreateUserInput { name: String!, email: String! }`
- Nullable by default in GraphQL — use `!` (non-null) intentionally
- Prefer specific fields over generic blobs

### Resolvers
- Keep resolvers thin — delegate to service/data layer
- Use DataLoader for batching and caching to prevent N+1 queries
- Implement field-level resolvers only for computed or expensive fields
- Handle errors by returning union types: `type Result = Success | Error`

### Pagination (Relay-Style)
- Use connection pattern: `edges { node, cursor }` + `pageInfo { hasNextPage, endCursor }`
- Support `first` / `after` (forward) and `last` / `before` (backward) pagination
- Return `totalCount` only if the underlying query is cheap

### Security
- Implement query depth limiting (max 10 levels)
- Implement query complexity analysis and reject expensive queries
- Disable introspection in production
- Apply field-level authorization on sensitive fields
- Rate limit by query complexity, not just request count

### Performance
- Enable automatic persisted queries (APQ) to reduce payload size
- Use response caching where appropriate (CDN, in-memory)
- Avoid over-fetching by designing precise query patterns

## gRPC and Service APIs

### Protobuf Contracts
- Define service contracts in `.proto` files as the source of truth
- Use versioned packages: `package myapp.v1;`
- Follow protobuf style guide: PascalCase for messages, snake_case for fields
- Generate client and server stubs from proto definitions

### When to Use gRPC
- Internal service-to-service communication (high throughput, low latency)
- Streaming use cases (bidirectional streaming, server push)
- Strongly typed contracts across multiple languages
- Not suitable for browser clients without grpc-web proxy

### Design Patterns
- Use unary RPCs for request-response, streaming for real-time or large data
- Define clear error codes using gRPC status codes (NOT_FOUND, INVALID_ARGUMENT, etc.)
- Implement health check service for load balancer integration
- Use interceptors for cross-cutting concerns (auth, logging, tracing)

## Webhooks

### Outbound Webhooks (Sending)
- Use POST with JSON body
- Include event type in body: `{ "event": "order.created", "data": {...} }`
- Sign payloads with HMAC-SHA256 for verification
- Include timestamp and idempotency key
- Implement retry with exponential backoff (1s, 5s, 30s, 5m, 30m)
- Allow subscribers to configure URL and which events they receive

### Inbound Webhooks (Consuming)
- Verify webhook signatures before processing (HMAC-SHA256 or similar)
- Respond with 200 immediately, process asynchronously (queue the work)
- Implement idempotency: deduplicate by event ID to handle retries
- Log all received webhooks for debugging and auditing
- Set up dead letter queue for failed webhook processing
- Handle out-of-order delivery gracefully

### Credential Rotation for Webhooks
- Support rotating webhook signing secrets without downtime
- Accept both old and new secrets during rotation window
- Provide API to regenerate webhook secrets
- Notify subscribers when secrets are rotated

## API Documentation

### OpenAPI / Swagger
- Maintain an OpenAPI 3.1 spec as the source of truth for REST APIs
- Auto-generate from code annotations or Zod schemas where possible
- Include examples for all request/response schemas
- Document error responses for every endpoint
- Keep documentation in sync with implementation (CI validation)

### Documentation Requirements
- Every endpoint must document: method, path, description, request body, response body, errors
- Include authentication requirements for each endpoint
- Document rate limits and pagination behavior
- Provide runnable examples (cURL, JavaScript, Python)
- Version documentation alongside API versions

### Interactive Documentation
- Serve Swagger UI or Redoc for interactive API exploration
- Enable "Try it out" functionality in non-production environments
- Include authentication helpers in interactive docs

## Client SDKs

### Best Practices (When Provided)
- Auto-generate SDKs from OpenAPI spec (openapi-generator, orval)
- Provide TypeScript types for all request/response shapes
- Handle authentication, retries, and error mapping in the SDK
- Version SDKs alongside the API
- Publish to package registries (npm, PyPI) for easy consumption

### SDK Design Principles
- Thin wrapper: SDK should be a convenience layer, not a framework
- Expose underlying HTTP client for advanced use cases
- Provide sensible defaults (timeout, retry, base URL)
- Include request/response interceptors for customization

## Rate Limiting

### Implementation
- Use sliding window or token bucket algorithm
- Store counters in Redis for distributed systems
- Return headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Different limits by endpoint type (auth = strict, reads = lenient)
- Different limits by user tier (free vs. paid)
