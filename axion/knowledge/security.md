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

### Two-Factor Authentication (2FA)
- Support TOTP-based 2FA (Google Authenticator, Authy) as minimum
- Provide recovery codes (8-10 single-use codes) during 2FA setup
- Require 2FA re-verification for sensitive actions (password change, payment method update)
- Step-up authentication: prompt for 2FA when accessing high-risk features
- Support WebAuthn/FIDO2 as a stronger phishing-resistant option
- Never send 2FA codes via SMS for high-security applications (SIM swap risk)

### Account Verification Flows
- Email verification: send confirmation link on registration, expire within 24 hours
- Use cryptographically random tokens for verification links (not sequential IDs)
- Rate limit verification email sends (max 3 per hour per account)
- Phone verification: use time-limited OTP codes (5-10 minutes)
- Re-verify email/phone if user changes the value

### Secure Logout and Token Revocation
- Invalidate server-side session on logout (not just client-side cookie deletion)
- Clear all auth-related cookies, tokens, and cached credentials on logout
- For JWT-based auth, maintain a token denylist or use short expiry + refresh rotation
- Revoke all active sessions when password is changed
- Provide "log out all devices" functionality

### Fraud and Abuse Controls
- Account lockout after failed attempts with progressive delays (1s, 5s, 30s, 5min)
- Detect anomalous login patterns: new device, new location, impossible travel
- Notify users of suspicious login activity via email
- Implement CAPTCHA or proof-of-work challenge after repeated failures
- Rate limit registration endpoints to prevent mass account creation
- Monitor for credential stuffing attacks (high volume of failed logins across accounts)

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

### ABAC and Capability-Based Models
- Attribute-Based Access Control (ABAC): decisions based on user/resource/environment attributes
- Use ABAC when RBAC is too coarse (e.g., "editors can edit only their department's docs")
- Capability-based: issue tokens/keys scoped to specific actions and resources
- Evaluate authorization needs: RBAC for simple apps, ABAC for complex multi-tenant systems
- Document the authorization model clearly for the team

### Rate Limiting for Auth Endpoints
- Login: 10 attempts per minute per IP, 5 per account
- Registration: 5 per hour per IP
- Password reset: 3 requests per hour per account
- 2FA verification: 5 attempts per session
- Return `429 Too Many Requests` without revealing account existence

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
- Never use GET requests for state-changing operations (only safe methods: GET, HEAD, OPTIONS)
- Handle CSRF token validation failure gracefully: show clear error, prompt re-authentication
- Re-authenticate before sensitive actions (password change, payment, account deletion)

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

### Secure Client-Side Storage
- Never store auth tokens in localStorage (XSS vulnerable)
- Use httpOnly cookies for session/refresh tokens
- On mobile: use platform secure storage (Keychain on iOS, Keystore on Android)
- Minimize persisted sensitive data — store only what's needed, encrypt the rest
- Clear all caches, tokens, and local storage on logout
- Prevent sensitive data from leaking into browser history or autofill

### Data Leakage Prevention
- Audit logs for accidental PII logging — use structured logging with field filtering
- Strip sensitive fields from analytics/tracking events
- Avoid recording password fields or sensitive form data in session replay tools
- Review browser network tab to ensure API responses don't include unnecessary sensitive fields

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

### Clickjacking and Embedding Protection
- Use `X-Frame-Options: DENY` to prevent framing entirely
- Use `Content-Security-Policy: frame-ancestors 'none'` (CSP takes precedence over X-Frame-Options)
- If embedding is needed, restrict to specific trusted origins: `frame-ancestors 'self' https://trusted.example.com`
- Coordinate X-Frame-Options and CSP frame-ancestors to ensure consistent behavior
- Test that the application cannot be embedded in malicious iframes

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

## Data Privacy and Telemetry Safety

### Analytics and Tracking
- Never send sensitive fields (passwords, tokens, PII) to analytics services
- Mask or hash user identifiers in analytics if full PII is not needed
- Implement consent-aware tracking: no tracking cookies before user consent (GDPR/CCPA)
- Review analytics payloads regularly for accidental data leakage

### PII in Logs
- Mask PII in all log output (emails, names, addresses, phone numbers)
- Use structured logging with explicit field allowlists
- Redact request/response bodies in logs for sensitive endpoints
- Never log full credit card numbers, SSNs, or passwords — even at DEBUG level

### Session Replay Safety
- Exclude password fields, payment forms, and PII from session replay recording
- Use CSS class or attribute masks to block sensitive form fields from capture
- Review session replay configuration after adding new forms or sensitive fields
- Inform users about session replay in privacy policy

## Secure Development Lifecycle

### Code Review Security Checks
- Review for hardcoded secrets, credentials, and API keys
- Check for proper input validation on all user-facing endpoints
- Verify authorization checks on new endpoints and data access paths
- Ensure error messages don't leak internal system details
- Validate that new dependencies don't introduce known vulnerabilities

### Security Testing
- Run SAST (Static Application Security Testing) tools in CI pipeline
- Perform DAST (Dynamic Application Security Testing) on staging environment
- Include security-focused test cases: injection, auth bypass, privilege escalation
- Conduct periodic penetration testing (annually for production applications)
- Use tools like Snyk, SonarQube, or Semgrep for automated security scanning

### Incident Response Preparation
- Define a security incident response plan with roles and escalation paths
- Maintain a list of critical assets and their owners
- Document procedures for: data breach, account compromise, DDoS, dependency vulnerability
- Conduct incident response drills at least annually
- Establish communication channels for security incidents (separate from normal ops)

### Security Headers Checklist
| Header | Purpose | Required |
|--------|---------|----------|
| Strict-Transport-Security | Force HTTPS | Yes |
| Content-Security-Policy | Prevent XSS, injection | Yes |
| X-Content-Type-Options | Prevent MIME sniffing | Yes |
| X-Frame-Options | Prevent clickjacking | Yes |
| Referrer-Policy | Control referrer leakage | Yes |
| Permissions-Policy | Restrict browser features | Yes |
| Cache-Control | Control caching of sensitive responses | Sensitive pages |
| Clear-Site-Data | Clear browser data on logout | Recommended |

### Cryptography Guidelines
- Use well-known libraries for crypto operations (never roll your own)
- AES-256-GCM for symmetric encryption at rest
- RSA-2048 or ECDSA P-256 minimum for asymmetric operations
- Use constant-time comparison for secret values (prevent timing attacks)
- Generate random values with cryptographically secure RNG (`crypto.randomBytes`)
- Keep encryption keys separate from encrypted data
