---
kid: "KID-LANG-RUST-WEB-0002"
title: "Security Checklist (Rust services)"
type: checklist
pillar: LANGUAGES_AND_LIBRARIES
domains: [rust]
subdomains: []
tags: [rust, security]
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

# Security Checklist (Rust services)

```markdown
# Security Checklist (Rust Services)

## Summary
This checklist provides actionable steps to secure Rust-based services, focusing on safe coding practices, dependency management, and runtime security. By adhering to these recommendations, developers can mitigate common vulnerabilities and ensure robust protection against potential threats.

## When to Use
- When developing new Rust services or maintaining existing ones.
- Before deploying a Rust service to production.
- During security audits or code reviews of Rust applications.
- When integrating third-party libraries into a Rust project.

## Do / Don't

### Do
1. **Do validate all external inputs** to prevent injection attacks and ensure data integrity.
2. **Do use `#![forbid(unsafe_code)]`** to enforce memory safety across the codebase unless absolutely necessary.
3. **Do keep dependencies up to date** by using tools like `cargo audit` to identify vulnerabilities.
4. **Do use strong types** to represent sensitive data such as passwords or tokens, reducing the risk of misuse.
5. **Do enable compiler warnings and lints** (e.g., `clippy`) to catch potential issues early.

### Don’t
1. **Don’t use `unsafe` blocks** unless absolutely necessary and well-documented.
2. **Don’t hardcode secrets** (e.g., API keys, passwords) in the codebase.
3. **Don’t ignore `Result` or `Option` return types**; always handle errors explicitly.
4. **Don’t use outdated or unmaintained dependencies** that may introduce vulnerabilities.
5. **Don’t expose sensitive internal APIs** or data structures unnecessarily.

## Core Content

### 1. Input Validation
- **Action**: Sanitize and validate all external inputs, including HTTP request parameters, environment variables, and file uploads.
- **Rationale**: Prevents injection attacks (e.g., SQL injection, command injection) and ensures data integrity.
- **Example**: Use libraries like `serde` for deserialization with strict schema definitions.

### 2. Memory Safety
- **Action**: Use `#![forbid(unsafe_code)]` in your `lib.rs` or `main.rs` to prevent accidental use of unsafe Rust.
- **Rationale**: Unsafe code bypasses Rust's guarantees, potentially introducing undefined behavior and memory vulnerabilities.
- **Example**: If unsafe code is required, isolate it in a well-documented module and conduct a thorough review.

### 3. Dependency Management
- **Action**: Regularly run `cargo audit` to identify and address vulnerabilities in dependencies.
- **Rationale**: Third-party libraries can introduce security risks if they are outdated or compromised.
- **Example**: Add `cargo audit` as part of your CI/CD pipeline to automate checks.

### 4. Secrets Management
- **Action**: Use environment variables or secret management tools (e.g., HashiCorp Vault) to store sensitive information securely.
- **Rationale**: Hardcoding secrets increases the risk of accidental exposure through source control or logs.
- **Example**: Use the `dotenv` crate to load secrets from environment variables during development.

### 5. Error Handling
- **Action**: Handle all `Result` and `Option` types explicitly, logging or propagating errors as appropriate.
- **Rationale**: Ignoring errors can lead to undefined behavior or security vulnerabilities.
- **Example**: Use the `anyhow` or `thiserror` crates for consistent error handling across your application.

### 6. Secure Communication
- **Action**: Enforce HTTPS/TLS for all network communication and validate certificates.
- **Rationale**: Protects data in transit from eavesdropping and man-in-the-middle attacks.
- **Example**: Use the `reqwest` crate with TLS enabled for making secure HTTP requests.

### 7. Logging and Monitoring
- **Action**: Implement structured logging and monitor logs for unusual activity.
- **Rationale**: Helps detect and respond to potential security incidents.
- **Example**: Use the `tracing` crate for structured and contextual logging.

### 8. Access Control
- **Action**: Use role-based access control (RBAC) or similar mechanisms to restrict access to sensitive APIs and data.
- **Rationale**: Minimizes the attack surface by enforcing the principle of least privilege.
- **Example**: Implement middleware to authenticate and authorize requests.

## Links
- [Rust Security Guidelines](https://doc.rust-lang.org) - Official guidelines for writing secure Rust code.
- [OWASP Top Ten](https://owasp.org) - A list of the most critical security risks for web applications.
- [Cargo Audit Documentation](https://docs.rs/cargo-audit) - Tool for auditing Rust dependencies for vulnerabilities.
- [Rust Clippy](https://github.com/rust-lang/rust-clippy) - A collection of lints to catch common mistakes in Rust code.

## Proof / Confidence
This checklist is based on industry standards such as the OWASP Top Ten and best practices outlined in the Rust documentation. Tools like `cargo audit` and `clippy` are widely adopted in the Rust community to ensure code quality and security. Following these practices has been shown to reduce vulnerabilities and improve the robustness of Rust applications.
```
