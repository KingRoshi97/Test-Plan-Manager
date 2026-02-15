# Error Handling & Observability Best Practices

## Error Classification

### Error Categories
| Category | HTTP Code | Retry? | User Message | Example |
|----------|-----------|--------|--------------|---------|
| Validation | 400/422 | No | Show field errors | Missing email, invalid format |
| Authentication | 401 | No | Redirect to login | Expired token, missing credentials |
| Authorization | 403 | No | Show access denied | Wrong role, resource not owned |
| Not Found | 404 | No | Show not found page | Invalid ID, deleted resource |
| Conflict | 409 | No | Show conflict message | Duplicate email, stale update |
| Rate Limit | 429 | Yes (after delay) | Show rate limit message | Too many requests |
| Server Error | 500 | Yes (with backoff) | Show generic error | Database down, unhandled exception |
| Service Unavailable | 503 | Yes (with backoff) | Show maintenance page | Dependency outage, overloaded |

## Error Taxonomy and Recovery Policy

### Classifying Errors by Domain
| Domain | Examples | Recovery Strategy |
|--------|---------|-------------------|
| Auth errors | Token expired, invalid credentials, 2FA required | Redirect to login, prompt re-auth, show 2FA input |
| Network errors | Timeout, connection reset, DNS failure | Auto-retry with backoff, show offline indicator |
| Validation errors | Invalid input, missing required fields | Show inline field errors, do not retry |
| Server errors | 500, unhandled exception, database down | Retry with backoff, show generic error, report to monitoring |
| Business logic errors | Insufficient funds, item out of stock | Show specific error, suggest alternatives |

### Per-Error Recovery Rules
- Define a recovery policy for each error category at the application level
- Auto-retry: network errors and server errors (max 3 attempts with backoff)
- Manual retry: provide a "Try again" button for user-initiated retries
- No retry: validation and auth errors — require user action
- Redirect: auth errors should route to login/re-auth flow

### User-Safe Error Messaging
- Map internal error codes to user-friendly messages
- Never expose stack traces, SQL errors, or internal identifiers to users
- Provide actionable guidance: "Check your internet connection and try again"
- Maintain a centralized error message catalog for consistency
- Include error codes for support reference: "Error ERR-1234 — contact support if this persists"

### Telemetry Hooks
- Emit structured error events to monitoring on every error
- Include: error code, category, user ID, request ID, timestamp, stack trace (server-side only)
- Tag errors with severity for alert routing
- Track error frequency to detect regressions and new error types

## Backend Error Handling

### Standard Error Response Shape
```json
{
  "error": {
    "code": "SCREAMING_SNAKE_CASE",
    "message": "Human-readable description for developers",
    "details": [],
    "request_id": "req_abc123"
  }
}
```

### Error Codes
- Use SCREAMING_SNAKE_CASE reason codes
- Prefix with domain: `AUTH_TOKEN_EXPIRED`, `ORDER_ALREADY_SHIPPED`
- Make codes specific enough to be actionable
- Document all error codes in API documentation

### Error Handling Middleware Pattern
```
1. Route handler throws or calls next(error)
2. Error middleware catches all errors
3. Classify error (validation, auth, server, etc.)
4. Log with context (request_id, user_id, stack trace for 5xx)
5. Return standardized error response
6. Never expose internal details in production (stack traces, SQL queries)
```

### Unhandled Errors
- Catch unhandled rejections and uncaught exceptions at process level
- Log the full error with stack trace
- Return generic 500 to client
- Report to error tracking service (Sentry)
- In severe cases, gracefully shut down and let process manager restart

## Frontend Error Handling

### Error Boundaries (React)
- Wrap each major section in an error boundary
- Show fallback UI with retry option
- Log error to monitoring service
- Don't wrap the entire app in one boundary (too coarse)

### API Error Handling
- Handle errors at the query/mutation level (TanStack Query `onError`)
- Show toast for non-blocking errors (failed to load sidebar data)
- Show inline errors for form submissions (field-level validation)
- Show full-page error for critical failures (main content failed to load)
- Always provide a retry action for transient errors

### UI State Machines for Error Recovery
- Model UI states explicitly: `idle` → `loading` → `success` | `error`
- Error state includes: error type, retry count, last attempt timestamp
- Transition rules: `error` → `retrying` → `success` | `error` (with max retries)
- Display different UI based on state: skeleton (loading), content (success), error message (error)
- Prevent invalid transitions: can't submit a form that's already submitting

### Background Sync State
- Track sync state: `pending` → `syncing` → `synced` | `failed`
- Show sync status indicator (e.g., "Saving...", "Saved", "Failed to save")
- Queue failed operations for retry when connection is restored
- Resolve conflicts when background sync succeeds but data has changed

### Reconnect and Recovery Flows
- Detect connection loss (navigator.onLine, WebSocket close events)
- Show offline indicator with clear messaging
- Queue actions performed offline for replay on reconnection
- Re-fetch stale data automatically on reconnection
- Handle WebSocket reconnection with exponential backoff

### Safe Destructive Actions
- **Confirm dialogs**: Require explicit confirmation for delete, overwrite, or irreversible actions
- **Undo window**: Provide 5-10 second undo period after destructive action (soft delete first)
- **Soft delete**: Mark as deleted, schedule hard delete after grace period
- **Type-to-confirm**: For high-risk operations, require typing the resource name

### Optimistic Updates
- Apply change optimistically for better UX
- Revert on server error with clear user feedback
- Only use for low-risk actions (liking, bookmarking) not high-risk (payments)

## Retry Strategies

### Exponential Backoff
- Base delay: 1 second
- Formula: `delay = min(baseDelay * 2^attempt, maxDelay)`
- Max delay: 30-60 seconds
- Max attempts: 3-5
- Add jitter (random 0-1s) to prevent thundering herd

### When to Retry
- Network timeouts (ETIMEDOUT)
- Connection resets (ECONNRESET)
- Service unavailable (503)
- Rate limited (429 — respect Retry-After header)
- Database connection lost (retry with new connection)

### When NOT to Retry
- Validation errors (400) — input won't change
- Authentication errors (401) — need new credentials
- Authorization errors (403) — permissions won't change
- Not found (404) — resource doesn't exist
- Conflict (409) — need user decision

## Structured Logging and Correlation

### Log Levels
| Level | When to Use | Alert? |
|-------|-------------|--------|
| ERROR | Action needed, something broke | Yes |
| WARN | Potential issue, degraded behavior | Monitor |
| INFO | Normal business events (user login, order placed) | No |
| DEBUG | Development troubleshooting details | No (never in production) |

### What to Log
- All incoming requests (method, path, status, duration)
- Authentication events (login, logout, failed attempts)
- Business events (order created, payment processed)
- External service calls (URL, status, duration)
- Errors with full context (stack trace, request data, user ID)

### What NOT to Log
- Passwords, tokens, API keys
- Credit card numbers, SSNs, PII
- Request/response bodies containing sensitive data
- Health check requests (too noisy)

### Request ID and Correlation
- Generate unique request ID for every incoming request (`X-Request-Id` header)
- Pass request ID through all internal service calls
- Include request ID in all log entries for that request
- Return request ID in response header for client-side correlation
- Use correlation ID to link related operations across services

### Structured Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "error",
  "message": "Failed to process payment",
  "request_id": "req_abc123",
  "correlation_id": "corr_xyz789",
  "user_id": "user_456",
  "service": "payment-service",
  "error_code": "PAYMENT_DECLINED",
  "duration_ms": 1250,
  "stack": "Error: Payment declined\n    at processPayment..."
}
```

### Log Aggregation
- Send all logs to a centralized system (Datadog, CloudWatch, Grafana Loki)
- Index by request_id, user_id, error_code for fast searching
- Set retention policies (30 days for DEBUG/INFO, 90+ days for ERROR)
- Create saved searches for common debugging patterns

## Distributed Tracing

### Tracing Awareness
- Propagate trace context (W3C Trace Context or B3 headers) across service boundaries
- Each service creates spans within the trace for its operations
- Include span metadata: operation name, duration, status, attributes
- Use OpenTelemetry for vendor-neutral instrumentation

### When to Implement Tracing
- Multi-service architectures (microservices, service mesh)
- When debugging latency requires visibility across service boundaries
- When error attribution across services is difficult with logs alone
- Not necessary for simple single-service applications

### Trace Context
- Trace ID: unique across the entire request flow
- Span ID: unique per operation within the trace
- Parent Span ID: links spans into a tree
- Baggage: key-value pairs propagated across all services (use sparingly)

## Alerting

### Alert Design
- Alert on symptoms, not causes (high error rate, not "database CPU high")
- Include runbook link in every alert
- Set appropriate severity levels (page for P1, Slack for P2, email for P3)
- Review and tune alerts monthly (eliminate noise, add missing coverage)

### Key Alerts
- Error rate > 1% for 5 minutes (P1)
- p95 latency > 2x normal for 10 minutes (P2)
- Database connection pool exhausted (P1)
- Disk space < 10% (P2)
- Certificate expiring in < 14 days (P3)
- Zero successful requests for 2 minutes (P1)

## Graceful Degradation
- Define critical vs. non-critical features
- When a non-critical dependency fails, hide the feature instead of erroring
- Cache last-known-good data for read-heavy features
- Show stale data with "last updated" indicator rather than an error page
- Use circuit breakers to stop calling failing dependencies

## Graceful Shutdown and Draining

### Server Shutdown Sequence
1. Stop accepting new connections (remove from load balancer)
2. Wait for in-flight requests to complete (drain period: 15-30 seconds)
3. Close database connections and external service clients
4. Flush pending logs and metrics
5. Exit process with code 0

### Drain Period Management
- Set a maximum drain timeout (30 seconds)
- Force-terminate long-running requests after drain timeout
- Send 503 to new requests during drain period
- Close WebSocket connections gracefully with close frame

### Signal Handling
- Handle `SIGTERM` for graceful shutdown (Kubernetes, Docker)
- Handle `SIGINT` for local development (Ctrl+C)
- Log shutdown initiation and completion
- Avoid `SIGKILL` handling (cannot be caught — ensure SIGTERM is handled promptly)
