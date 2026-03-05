---
kid: "KID-LANG-PY-FASTAPI-0004"
title: "Security Checklist (FastAPI)"
type: checklist
pillar: LANGUAGES_AND_LIBRARIES
domains: [python, fastapi]
subdomains: []
tags: [fastapi, security]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Security Checklist (FastAPI)

# Security Checklist (FastAPI)

## Summary

This checklist outlines actionable security measures for building and deploying FastAPI applications. It covers authentication, authorization, data validation, and secure configurations to minimize vulnerabilities. Following these steps ensures your FastAPI applications are robust against common security threats.

---

## When to Use

- When developing new FastAPI applications.
- During code reviews or security audits of existing FastAPI applications.
- Before deploying FastAPI applications to production environments.
- When updating dependencies or integrating third-party libraries.

---

## Do / Don't

### Do:
1. **Do validate all incoming data.** Use Pydantic models to enforce strict data validation and prevent injection attacks.
2. **Do use HTTPS in production.** Ensure all traffic is encrypted to protect sensitive data in transit.
3. **Do configure CORS properly.** Restrict origins, methods, and headers to trusted sources only.
4. **Do set up rate limiting.** Protect your APIs from brute force and denial-of-service attacks.
5. **Do keep dependencies updated.** Regularly check for and patch known vulnerabilities in your libraries.

### Don’t:
1. **Don’t expose sensitive environment variables.** Use a `.env` file and a library like `python-decouple` or `dotenv` to manage secrets securely.
2. **Don’t use default configurations in production.** Many defaults are not secure; customize configurations for your use case.
3. **Don’t trust user input.** Always sanitize and validate inputs, even if they seem benign.
4. **Don’t hardcode secrets.** Never store API keys, passwords, or other credentials directly in your codebase.
5. **Don’t ignore security headers.** Missing or misconfigured headers can expose your app to attacks like clickjacking or XSS.

---

## Core Content

### Authentication and Authorization
- **Use OAuth2 or JWT for authentication.** FastAPI provides built-in support for OAuth2 with password flow and JWT tokens. Implement secure token storage and expiration policies.
  - *Rationale:* Weak or improperly implemented authentication can lead to unauthorized access.
- **Enforce role-based access control (RBAC).** Define roles and permissions to restrict access to sensitive endpoints.
  - *Rationale:* Minimizes the impact of compromised accounts or privilege escalation.

### Data Validation and Sanitization
- **Validate all inputs with Pydantic models.** Define strict data schemas to prevent injection attacks and ensure data integrity.
- **Sanitize outputs.** Avoid reflecting user input directly in responses to prevent XSS attacks.

### Secure Configurations
- **Enable HTTPS with a valid TLS certificate.** Use tools like Let's Encrypt to obtain certificates for free.
- **Set secure cookie flags.** Use `Secure`, `HttpOnly`, and `SameSite` attributes for cookies.
  - *Rationale:* Prevents session hijacking and cross-site request forgery (CSRF).
- **Configure CORS policies.** Use FastAPI’s `CORSMiddleware` to restrict origins, methods, and headers.
  - *Rationale:* Prevents unauthorized access from untrusted domains.

### Dependency Management
- **Use virtual environments.** Isolate dependencies with tools like `venv` or `poetry`.
- **Audit dependencies regularly.** Use tools like `pip-audit` or `safety` to identify vulnerabilities in your Python packages.
  - *Rationale:* Outdated or vulnerable libraries are a common attack vector.

### Logging and Monitoring
- **Implement structured logging.** Use libraries like `structlog` or `loguru` to capture detailed logs without exposing sensitive data.
- **Monitor for suspicious activity.** Set up alerts for unusual patterns, such as repeated failed login attempts.

### Security Headers
- **Set HTTP security headers.** Use middleware or tools like `secure` to configure headers such as:
  - `Content-Security-Policy` (CSP): Prevents XSS attacks.
  - `X-Frame-Options`: Prevents clickjacking.
  - `X-Content-Type-Options`: Prevents MIME-type sniffing.
  - *Rationale:* Proper headers reduce the attack surface of your application.

### Rate Limiting and Throttling
- **Use rate limiting.** Integrate libraries like `slowapi` to throttle requests and prevent abuse.
- **Implement IP blocking.** Block suspicious IPs or ranges after repeated violations.

---

## Links

- **OWASP Top Ten**: A comprehensive guide to the most critical security risks for web applications.
- **FastAPI Security Documentation**: Official FastAPI documentation on authentication and security features.
- **Pydantic Documentation**: Best practices for data validation and schema enforcement.
- **TLS Best Practices**: Guidelines for implementing HTTPS and securing data in transit.

---

## Proof / Confidence

This checklist is based on industry standards, including the OWASP Top Ten and Python security best practices. FastAPI's official documentation and community recommendations were also referenced. Tools like `pip-audit` and `slowapi` are widely used in production environments to mitigate risks. Following these practices aligns with common security benchmarks for modern web applications.
