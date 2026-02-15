# Security Best Practices

## Authentication

### Password Handling
- Hash with bcrypt (cost factor 12+) or Argon2id
- Minimum password length: 8 characters (NIST recommends no max, no complexity rules)
- Never store plaintext passwords, never log passwords
- Implement account lockout after 5-10 failed attempts (with exponential backoff)

### Session Management
- Use httpOnly, secure, sameSite=strict cookies for session tokens
- Session expiry: 24 hours for standard apps, 15-30 minutes for sensitive apps
- Regenerate session ID after login (prevents session fixation)
- Implement idle timeout separate from absolute timeout

### JWT Best Practices
- Use short-lived access tokens (15-30 minutes)
- Use long-lived refresh tokens (7-30 days) stored securely (httpOnly cookie)
- Always validate `iss`, `aud`, `exp` claims
- Use RS256 (asymmetric) for distributed systems, HS256 for single-service
- Never store JWTs in localStorage (XSS vulnerable)

### OAuth / Social Login
- Always validate the `state` parameter to prevent CSRF
- Use PKCE for public clients (SPAs, mobile apps)
- Validate token issuer and audience on every request
- Request minimum scopes needed

## Authorization

### Role-Based Access Control (RBAC)
- Define roles at the application level, not the database level
- Common hierarchy: viewer → editor → admin → super_admin
- Check permissions at both API route and data access layer
- Never rely solely on frontend route guards

### Resource-Level Authorization
- Always verify the requesting user owns or has access to the resource
- Pattern: `if (resource.ownerId !== currentUser.id) throw 403`
- Implement this in a middleware or service layer, not in every route handler

## Input Validation & Sanitization

### General Rules
- Validate all input on the server (never trust client validation alone)
- Use allowlists over denylists (specify what IS allowed, not what isn't)
- Validate type, length, range, and format for every field
- Use Zod or similar schema validation library for structured validation

### SQL Injection Prevention
- Use parameterized queries / prepared statements (ORMs handle this)
- Never concatenate user input into SQL strings
- Validate and sanitize identifiers (table names, column names) if dynamic

### XSS Prevention
- Escape all user-generated content before rendering in HTML
- Use Content Security Policy (CSP) headers
- React auto-escapes by default — never use `dangerouslySetInnerHTML` with user input
- Sanitize HTML if rich text is required (use DOMPurify)

### CSRF Prevention
- Use SameSite=Strict cookies (eliminates most CSRF vectors)
- Implement CSRF tokens for cookie-based auth with SameSite=Lax
- Verify Origin/Referer headers on state-changing requests

## API Security

### Rate Limiting
- Apply rate limits to all endpoints, stricter on auth endpoints
- Standard limits: 100 req/min general, 10 req/min for login, 5 req/min for registration
- Return `429 Too Many Requests` with `Retry-After` header
- Implement per-user and per-IP rate limiting

### Request Size Limits
- Set maximum request body size (1MB default, adjust for file uploads)
- Limit query string length
- Limit number of items in array parameters

### CORS Configuration
- Never use `Access-Control-Allow-Origin: *` in production
- Explicitly list allowed origins
- Only allow necessary HTTP methods and headers
- Set `Access-Control-Max-Age` to cache preflight responses

## Data Protection

### Sensitive Data Handling
- Encrypt sensitive data at rest (AES-256-GCM)
- Use TLS 1.2+ for all data in transit (enforce HTTPS)
- Never log sensitive data (passwords, tokens, SSNs, credit cards)
- Implement data masking for display (show last 4 digits of SSN/credit card)

### Environment Variables & Secrets
- Never commit secrets to version control
- Use environment variables or a secrets manager
- Rotate secrets on a regular schedule
- Use different secrets for development, staging, and production

## HTTP Security Headers

### Required Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## File Upload Security
- Validate file type by magic bytes (not just extension)
- Set maximum file size limits
- Store uploads outside the web root or in object storage
- Generate random filenames (never use user-provided filenames directly)
- Scan for malware if accepting public uploads
- Serve user uploads from a separate domain/subdomain

## Dependency Security
- Run `npm audit` regularly and fix critical/high vulnerabilities
- Pin dependency versions in production
- Use Dependabot or Renovate for automated updates
- Review new dependencies before adding (check downloads, maintenance, known issues)
