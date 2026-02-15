# Frontend Security Best Practices

## XSS Prevention

### Output Encoding
- React auto-escapes JSX expressions by default (safe for most cases)
- Never use `dangerouslySetInnerHTML` with user-provided content
- If rich text is required: sanitize with DOMPurify before rendering
- Configure DOMPurify: allowlist safe tags/attributes, strip everything else
- Context-aware encoding: HTML entities for HTML context, URL encoding for URLs

### Content Security Policy (CSP)
- Set `Content-Security-Policy` header to restrict resource loading
- Start strict: `default-src 'self'`
- Add exceptions as needed: `script-src 'self'`, `style-src 'self' 'unsafe-inline'` (if needed)
- `img-src 'self' data: https:` — allow images from HTTPS and data URIs
- `connect-src 'self' https://api.example.com` — restrict API endpoints
- `frame-ancestors 'none'` — prevent framing (clickjacking protection)
- Report violations: `report-uri /csp-violations` or `report-to` directive
- Use nonce-based script loading for inline scripts: `script-src 'nonce-{random}'`

### DOM-Based XSS Prevention
- Avoid: `document.write()`, `innerHTML`, `outerHTML` with user data
- Avoid: `eval()`, `new Function()`, `setTimeout(string)` with user input
- Use: `textContent` for text, DOM APIs for element creation
- URL sanitization: validate protocol (reject `javascript:`, `data:` schemes)
- Template literal injection: never interpolate user input into HTML template strings

### Trusted Types API
- Enable Trusted Types to prevent DOM XSS at the browser level
- Requires refactoring all DOM sink usage to use type-safe APIs
- CSP header: `require-trusted-types-for 'script'`
- Create policies for legitimate dynamic content needs

## CSRF Protection

### SameSite Cookies
- Set `SameSite=Strict` for session cookies (strongest CSRF protection)
- Use `SameSite=Lax` if cross-site navigation needs to send cookies (OAuth redirect flows)
- Combined with `Secure` and `HttpOnly` flags: defense in depth

### CSRF Token Pattern
- For `SameSite=Lax` configurations: implement CSRF tokens
- Generate unique token per session (cryptographically random)
- Include token in form submissions (hidden field) and AJAX requests (header)
- Validate token on server for all state-changing requests (POST, PUT, PATCH, DELETE)

### Double-Submit Cookie
- Set CSRF token in cookie AND require in request header/body
- Server compares cookie value with header/body value
- Works for stateless backends (no server-side token storage)

### Additional Protections
- Verify `Origin` and `Referer` headers on state-changing requests
- Never use GET for state-changing operations
- Re-authenticate for sensitive actions (password change, payment, admin operations)
- Custom request headers (`X-Requested-With`) for AJAX (rejected by CORS preflight)

## Secure Client-Side Storage

### Storage Classification
| Data | Storage | Security |
|------|---------|----------|
| Session tokens | httpOnly Secure cookie | Can't be accessed by JavaScript |
| Refresh tokens | httpOnly Secure cookie | Automatic CSRF via SameSite |
| User preferences | localStorage | Not sensitive, persist across sessions |
| Form drafts | localStorage | Clear on submission, TTL-based expiry |
| Sensitive data | Memory only (React state) | Cleared on page close |
| Large datasets | IndexedDB | Encrypt sensitive fields |

### localStorage Security
- Never store: authentication tokens, API keys, PII, payment data
- OK to store: theme preference, locale, non-sensitive UI state
- Set expiry: check timestamp on read, discard stale data
- Clear on logout: remove all app-related localStorage entries
- Namespace keys: `appName:keyName` to avoid collisions

### sessionStorage Security
- Scoped to tab: data not shared across tabs/windows
- Use for: temporary wizard state, form data within a session
- Not persisted: cleared when tab closes (not suitable for long-term state)
- Same security rules as localStorage (don't store secrets)

### Cookies Security
- `HttpOnly`: prevent JavaScript access (XSS can't steal cookie)
- `Secure`: only sent over HTTPS
- `SameSite`: Strict or Lax to prevent CSRF
- `Path`: restrict to specific URL paths
- `Domain`: restrict to specific domain (don't set to top-level domain)
- `Max-Age` / `Expires`: set appropriate expiry (don't leave indefinite)

### Clearing Sensitive Data
- Clear tokens and sensitive data from all storage on logout
- Clear localStorage, sessionStorage, and cookies (app-scoped)
- Invalidate tokens server-side (don't just remove client-side)
- Clear in-memory state (React state, store state)
- Handle multiple tabs: use storage event listener to sync logout across tabs

## Dependency Security

### Supply Chain Risks
- Typosquatting: verify package names carefully before installing
- Compromised packages: monitor for known vulnerabilities (npm audit, Snyk)
- Dependency confusion: use scoped packages and configure registries correctly
- Malicious maintainer takeover: watch for unexpected major version changes

### Dependency Management
- Lockfile: always commit (pin exact versions for reproducible installs)
- Audit: `npm audit` in CI, fail on critical/high severity
- Automated updates: Dependabot or Renovate for automated PRs
- Review: check package reputation before adding (downloads, maintenance, known issues)
- Minimize: fewer dependencies = smaller attack surface

### Subresource Integrity (SRI)
- Use SRI hashes for CDN-loaded scripts and stylesheets
- `<script src="..." integrity="sha384-..." crossorigin="anonymous">`
- Prevents CDN compromise from injecting malicious code
- Generate hashes during build, update on dependency change

### Build-Time Security
- Pin Node.js and npm versions in CI (prevent supply chain attacks on build tools)
- Verify package signatures where available
- Scan build output for embedded secrets (API keys, tokens)
- Use `--ignore-scripts` for `npm install` in CI where possible (prevent postinstall attacks)

## Session and Authentication Safety

### Token Handling
- Store access tokens in memory (React state or context) — not localStorage
- Store refresh tokens in httpOnly Secure cookies (sent automatically)
- Short-lived access tokens: 15-30 minutes
- Refresh transparently: intercept 401, refresh token, retry request
- Handle refresh failure: redirect to login, clear all state

### Session Timeout UX
- Idle timeout warning: show dialog before session expires
- Countdown: "Your session will expire in 5 minutes. [Extend]"
- Grace period: allow extending session without re-login
- Expired session: redirect to login, preserve intended destination
- Multi-tab: sync session state across tabs (storage event listener)

### OAuth/OIDC Frontend
- Use Authorization Code flow with PKCE (proof key for code exchange)
- Never use Implicit flow (tokens in URL fragment — vulnerable to leaks)
- Validate state parameter to prevent CSRF
- Store tokens securely (memory for access, httpOnly cookie for refresh)
- Handle token refresh transparently in HTTP interceptor

### Logout Security
- Clear all client-side state: memory, localStorage, sessionStorage, cookies
- Invalidate session/tokens server-side (POST /logout)
- Redirect to login page after logout
- Handle "back button after logout" (don't show cached authenticated pages)
- Federated logout: notify identity provider if using SSO

## Network Security

### HTTPS Enforcement
- All resources loaded over HTTPS (no mixed content)
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Redirect HTTP → HTTPS at server/CDN level
- Verify TLS certificate validity (browser handles this, but check in service workers)

### API Request Security
- Include authentication token in every API request (Authorization header or cookie)
- Validate API response format (don't trust server response blindly)
- Set request timeouts (prevent hanging requests from degrading UX)
- Handle network errors gracefully (offline, timeout, server error)

### WebSocket Security
- Authenticate WebSocket connections (token in handshake or first message)
- Validate all incoming WebSocket messages (don't trust server data shape)
- Reconnect with backoff on disconnection
- Close connections on logout and session expiry

### CORS Handling
- Frontend doesn't set CORS headers (server responsibility)
- Understand CORS errors: typically means server isn't configured for your origin
- Never proxy to bypass CORS (bypasses security controls)
- Preflight requests (OPTIONS): handled automatically by browser

## Rendering Security

### Iframe Protection
- Prevent your app from being framed: `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`
- When embedding third-party iframes: use `sandbox` attribute
- `sandbox="allow-scripts allow-same-origin"` — restrict iframe capabilities
- Communicate with iframes via `postMessage` (validate origin on receipt)

### URL and Link Safety
- Validate URLs before rendering as links (reject `javascript:`, `data:` schemes)
- Open external links with `rel="noopener noreferrer"` and `target="_blank"`
- User-generated URLs: validate format, reject dangerous schemes
- Sanitize URL parameters before using in page logic or API calls

### User-Generated Content (UGC)
- Markdown rendering: use a safe renderer that strips HTML (or sanitize output)
- Image URLs: validate protocol (HTTPS only), consider proxying through your server
- Links: validate and potentially allowlist domains
- Rich text: sanitize with DOMPurify, allowlist safe tags/attributes

### SVG Security
- SVGs can contain JavaScript: sanitize SVG uploads (strip `<script>`, event handlers)
- Serve user-uploaded SVGs with `Content-Type: image/svg+xml` (not `text/html`)
- Consider converting user SVGs to raster format (PNG) for display
- Inline SVGs from untrusted sources: sanitize before rendering

## Data Privacy in Frontend

### Analytics and Tracking Safety
- Don't send PII to analytics services (no emails, names, phone numbers in events)
- Hash or anonymize user identifiers before sending to third-party analytics
- Respect Do Not Track (DNT) and Global Privacy Control (GPC) signals
- Cookie consent: implement cookie banner for jurisdictions that require it (GDPR, ePrivacy)
- Review analytics event payloads regularly for accidental PII leakage

### Session Recording Safety
- If using session recording tools (FullStory, Hotjar): mask sensitive fields
- Configure: block recording of password fields, credit card inputs, PII forms
- Don't record: payment forms, authentication flows, sensitive data entry
- Inform users about session recording (privacy policy)

### Client-Side Logging
- Never log: passwords, tokens, credit card numbers, SSNs
- Mask PII in error reports: redact email, phone, name from error context
- Client-side error reporting (Sentry): configure data scrubbing rules
- Review error report payloads for accidental sensitive data inclusion

### Clipboard and Screen Capture
- Don't copy sensitive data to clipboard without user action
- Clear clipboard after timeout for auto-copied sensitive data (e.g., one-time codes)
- Prevent sensitive data from appearing in screenshots/screen sharing where possible
- Use CSS `user-select: none` on sensitive displayed data (prevents accidental copying)

## Build and Deployment Security

### Environment Variables
- Frontend env vars: only non-sensitive configuration (API URLs, feature flags)
- Prefix required: `VITE_`, `NEXT_PUBLIC_` (ensures intentional exposure)
- Never embed: API keys, database URLs, secret keys in frontend code
- Build-time injection: values baked into bundle at build time (visible in source)
- Server-side proxy: route sensitive API calls through your backend

### Source Map Management
- Don't deploy source maps to production (exposes source code)
- Upload source maps to error tracking service (Sentry) for debugging
- Or restrict source maps via authentication (serve only to authorized users)

### Bundle Security
- Scan build output for embedded secrets (regex-based scanning in CI)
- Minimize exposed surface: don't bundle unused code or dead features
- Integrity: use SRI for any externally hosted scripts/styles
- Monitor: track bundle size and contents for unexpected additions

## Error Handling Security

### Safe Error Messages
- Never display: stack traces, SQL queries, internal server paths, dependency versions
- User-facing errors: generic, helpful messages ("Something went wrong. Please try again.")
- Developer errors: detailed in browser console (development mode only)
- Error boundaries: catch rendering errors, show safe fallback UI

### Error Reporting
- Report to error tracking service (Sentry, Bugsnag) with context
- Strip PII from error context before reporting
- Include: browser, OS, app version, anonymized user ID, error stack trace
- Configure: ignore known harmless errors (ResizeObserver, extension-injected errors)
- Rate limit: don't flood error tracking with duplicate reports
