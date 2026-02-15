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

## Logging Best Practices

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

### Request ID
- Generate unique request ID for every incoming request
- Pass through all internal service calls
- Include in all log entries for that request
- Return in response header (`X-Request-Id`) for client-side correlation

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
