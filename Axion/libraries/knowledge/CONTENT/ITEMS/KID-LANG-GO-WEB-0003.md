---
kid: "KID-LANG-GO-WEB-0003"
title: "Security Checklist (Go services)"
content_type: "checklist"
primary_domain: "["
secondary_domains:
  - "g"
  - "o"
  - "]"
industry_refs: []
stack_family_refs:
  - "frameworks"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "g"
  - "o"
  - ","
  - " "
  - "s"
  - "e"
  - "c"
  - "u"
  - "r"
  - "i"
  - "t"
  - "y"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/go/frameworks/web/KID-LANG-GO-WEB-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Security Checklist (Go services)

```markdown
# Security Checklist (Go Services)

## Summary

This checklist provides actionable steps to secure Go services, focusing on common vulnerabilities and best practices. It covers secure coding, dependency management, and runtime configurations to minimize attack surfaces and protect sensitive data.

## When to Use

Use this checklist when:
- Developing new Go services.
- Reviewing existing Go codebases for security vulnerabilities.
- Preparing Go services for deployment to production environments.
- Conducting security audits or compliance checks.

## Do / Don't

### Do:
1. **Do validate all user inputs** to prevent injection attacks and other vulnerabilities.
2. **Do use `crypto` and `golang.org/x/crypto` libraries** for cryptographic operations instead of implementing your own.
3. **Do enable HTTPS** and enforce secure communication using TLS.
4. **Do regularly update dependencies** and monitor for known vulnerabilities using tools like `govulncheck`.
5. **Do log security-relevant events** using structured logging libraries like `logrus` or `zap`.

### Don't:
1. **Don't hardcode secrets or credentials** in your codebase; use environment variables or secret management tools.
2. **Don't disable TLS verification** in HTTP clients unless absolutely necessary.
3. **Don't use outdated or insecure cryptographic algorithms**, such as MD5 or SHA-1.
4. **Don't expose sensitive information** in error messages or logs.
5. **Don't ignore Go’s race detector warnings**, as data races can lead to unpredictable behavior and vulnerabilities.

## Core Content

### Input Validation
- **Sanitize and validate all user inputs** to prevent injection attacks. Use libraries like `github.com/go-playground/validator` for validation.
- Avoid unsafe functions like `fmt.Sprintf` for constructing SQL queries; use parameterized queries with `database/sql`.

### Dependency Management
- Use `govulncheck` to scan for vulnerabilities in your dependencies.
- Regularly update Go modules with `go get -u` and review changelogs for breaking changes or security fixes.
- Avoid using unmaintained or unverified third-party libraries.

### Secure Communication
- Use HTTPS for all external and internal communication. Configure TLS with strong ciphers and disable weak ones.
- Use `net/http`'s `http.Server` with `TLSConfig` to enforce secure defaults.
- Set `Strict-Transport-Security` headers to prevent downgrade attacks.

### Authentication and Authorization
- Use established libraries like `github.com/dgrijalva/jwt-go` or `github.com/golang-jwt/jwt` for token-based authentication.
- Implement role-based access control (RBAC) or attribute-based access control (ABAC) for fine-grained permissions.
- Always hash passwords using `bcrypt` (`golang.org/x/crypto/bcrypt`) before storing them.

### Secure Configuration
- Store secrets in a secure vault like HashiCorp Vault, AWS Secrets Manager, or GCP Secret Manager.
- Use environment variables for configuration and avoid embedding sensitive data in the codebase.
- Set up a secure Content Security Policy (CSP) to mitigate cross-site scripting (XSS) risks.

### Logging and Monitoring
- Use structured logging libraries like `logrus` or `zap` for consistent log formatting.
- Mask sensitive data such as passwords and tokens in logs.
- Set up monitoring and alerting for unusual activity, such as failed login attempts or high error rates.

### Runtime Security
- Use Go’s `race` detector to identify and fix data races during development.
- Run your services in a sandboxed environment, such as Docker containers with restricted permissions.
- Limit resource usage (CPU, memory) using cgroups or Kubernetes resource quotas.

### Cryptography
- Use `crypto/rand` for generating secure random numbers.
- Avoid insecure algorithms like MD5, SHA-1, or DES; prefer SHA-256 or SHA-3 for hashing.
- Use `crypto/tls` for secure communication and configure it to enforce modern cryptographic standards.

## Links

- **Go Vulnerability Management**: Overview of `govulncheck` and Go's vulnerability database.
- **OWASP Top Ten**: Common security risks and mitigation strategies.
- **Go Secure Coding Practices**: Official guidelines for writing secure Go code.
- **TLS Best Practices**: Recommendations for configuring TLS securely.

## Proof / Confidence

This checklist is based on industry standards such as OWASP, NIST, and Go's official documentation. Tools like `govulncheck` and libraries from `golang.org/x` are widely recommended in the Go community. Adopting these practices aligns with best practices for secure software development and reduces the risk of common vulnerabilities.
```
