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
  "data": [...],
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

## Webhooks (Outbound)

### Design
- Use POST with JSON body
- Include event type in body: `{ "event": "order.created", "data": {...} }`
- Sign payloads with HMAC-SHA256 for verification
- Include timestamp and idempotency key
- Implement retry with exponential backoff (1s, 5s, 30s, 5m, 30m)
- Allow subscribers to configure URL and which events they receive

## Rate Limiting

### Implementation
- Use sliding window or token bucket algorithm
- Store counters in Redis for distributed systems
- Return headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Different limits by endpoint type (auth = strict, reads = lenient)
- Different limits by user tier (free vs. paid)
