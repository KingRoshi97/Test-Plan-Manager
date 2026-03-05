---
kid: "KID-ITSEC-REF-0002"
title: "Common HTTP Security Headers Reference"
type: "reference"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "reference"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Common HTTP Security Headers Reference

# Common HTTP Security Headers Reference

## Summary
HTTP security headers are critical for protecting web applications against common vulnerabilities such as cross-site scripting (XSS), clickjacking, and protocol downgrade attacks. This reference outlines the most widely used security headers, their configurations, and best practices to ensure secure communication between clients and servers.

## When to Use
- When configuring web servers (e.g., Apache, Nginx, IIS) to enforce secure communication.
- When developing or deploying web applications to mitigate security risks.
- During security audits or penetration testing to identify missing or misconfigured headers.
- When implementing Content Security Policies (CSP) or hardening application security.

## Do / Don't

### Do:
1. **Enable HTTPS**: Always use security headers in conjunction with HTTPS to prevent data interception.
2. **Set `Strict-Transport-Security`**: Enforce HTTPS connections using the HSTS header.
3. **Use `Content-Security-Policy`**: Define allowed sources for scripts, styles, and other resources to mitigate XSS attacks.
4. **Configure `X-Frame-Options`**: Prevent clickjacking by restricting iframe embedding.
5. **Regularly Audit Headers**: Periodically review and update header configurations based on evolving security threats.

### Don't:
1. **Use Wildcard Sources in CSP**: Avoid using `*` or overly permissive directives in `Content-Security-Policy`.
2. **Neglect Header Testing**: Do not deploy applications without verifying header functionality using tools like OWASP ZAP or browser dev tools.
3. **Disable Security Headers for Debugging**: Never disable headers like `X-Content-Type-Options` or `Referrer-Policy` in production environments.
4. **Ignore Browser Compatibility**: Do not assume all browsers interpret headers uniformly; test across major browsers.
5. **Use Default Server Configurations**: Avoid relying on default web server settings, as they may not include essential security headers.

## Core Content

### Key HTTP Security Headers

| **Header**                  | **Purpose**                                                                 | **Example Configuration**                                                                 |
|-----------------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| `Strict-Transport-Security` | Enforces HTTPS connections and prevents protocol downgrade attacks.         | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`                |
| `Content-Security-Policy`   | Mitigates XSS and data injection by defining allowed content sources.       | `Content-Security-Policy: default-src 'self'; script-src 'self' 'https://trusted.com'`   |
| `X-Frame-Options`           | Prevents clickjacking by controlling iframe embedding.                     | `X-Frame-Options: DENY`                                                                  |
| `X-Content-Type-Options`    | Prevents MIME-type sniffing by enforcing declared content types.           | `X-Content-Type-Options: nosniff`                                                       |
| `Referrer-Policy`           | Controls the amount of referrer information sent with requests.            | `Referrer-Policy: no-referrer`                                                          |
| `Permissions-Policy`        | Restricts browser features like geolocation, camera, and microphone access.| `Permissions-Policy: geolocation=(), microphone=()`                                      |
| `Cache-Control`             | Controls caching behavior to prevent sensitive data exposure.              | `Cache-Control: no-store, no-cache, must-revalidate`                                     |

### Configuration Options
1. **Strict-Transport-Security**:
   - `max-age`: Duration (in seconds) for enforcing HTTPS.
   - `includeSubDomains`: Apply HSTS to all subdomains.
   - `preload`: Register domain for HSTS preload lists.

2. **Content-Security-Policy**:
   - `default-src`: Default policy for content sources.
   - `script-src`, `style-src`: Specify trusted domains for scripts and styles.
   - `report-uri`: Endpoint for CSP violation reports.

3. **X-Frame-Options**:
   - `DENY`: Disallow embedding in iframes entirely.
   - `SAMEORIGIN`: Allow embedding only on the same domain.

4. **Referrer-Policy**:
   - `no-referrer`: No referrer information sent.
   - `strict-origin`: Send referrer only for HTTPS requests.

### Testing and Validation
- Use tools like OWASP ZAP, Burp Suite, or browser developer tools to verify header configurations.
- Regularly scan for missing or misconfigured headers using automated security scanners.

## Links
- **OWASP Secure Headers Project**: Comprehensive guide to HTTP security headers.
- **RFC 6797**: Standard for HTTP Strict Transport Security (HSTS).
- **Content Security Policy (CSP) Level 3**: W3C specification for CSP.
- **Mozilla Developer Network (MDN)**: Detailed documentation on HTTP headers.

## Proof / Confidence
This reference is supported by industry standards such as OWASP Secure Headers Project and RFC specifications (e.g., RFC 6797 for HSTS). Security headers are widely adopted by major web platforms and recommended by organizations like OWASP and NIST for mitigating common web vulnerabilities. Regular audits and penetration tests confirm their effectiveness in reducing attack vectors.
