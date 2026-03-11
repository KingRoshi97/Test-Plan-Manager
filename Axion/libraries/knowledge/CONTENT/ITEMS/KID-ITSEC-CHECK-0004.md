---
kid: "KID-ITSEC-CHECK-0004"
title: "Logging Checklist (no secrets, correlation IDs, audit fields)"
content_type: "checklist"
primary_domain: "security_fundamentals"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "security_fundamentals"
  - "checklist"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/checklists/KID-ITSEC-CHECK-0004.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Logging Checklist (no secrets, correlation IDs, audit fields)

# Logging Checklist (No Secrets, Correlation IDs, Audit Fields)

## Summary
This checklist ensures secure, effective, and compliant logging practices in software systems. It focuses on avoiding sensitive data exposure, enabling traceability with correlation IDs, and maintaining audit fields for accountability. Following these practices strengthens security, facilitates debugging, and supports regulatory compliance.

## When to Use
- During application development and deployment phases.
- When configuring logging frameworks or libraries.
- When reviewing or auditing logging practices for security and compliance.
- In systems handling sensitive data, regulated environments, or high-security applications.

## Do / Don't

### Do
1. **Do sanitize logs to exclude sensitive data** (e.g., passwords, API keys, PII).  
   Rationale: Prevent accidental exposure of secrets that could be exploited by attackers.
2. **Do implement correlation IDs for distributed systems** to trace requests across services.  
   Rationale: Improves debugging and monitoring in microservices architectures.
3. **Do include audit fields** (e.g., timestamps, user IDs, action types) for accountability.  
   Rationale: Supports compliance and forensic investigations.
4. **Do configure log levels appropriately** (e.g., DEBUG, INFO, WARN, ERROR) to avoid excessive verbosity.  
   Rationale: Prevents log overload and ensures useful information is captured.
5. **Do encrypt log files or use secure storage** to protect sensitive operational data.  
   Rationale: Mitigates risks of unauthorized access to logs.

### Don't
1. **Don’t log secrets or sensitive data** (e.g., credit card numbers, authentication tokens).  
   Rationale: Violates security principles and compliance requirements like GDPR or PCI DSS.
2. **Don’t use hardcoded correlation IDs**; generate them dynamically per request.  
   Rationale: Prevents ID collisions and ensures accurate tracing.
3. **Don’t log excessive information** (e.g., full stack traces in production logs).  
   Rationale: Reduces log noise and prevents exposure of internal system details.
4. **Don’t disable logging in production environments** unless explicitly required.  
   Rationale: Critical for monitoring and incident response.
5. **Don’t store logs indefinitely** without a retention policy.  
   Rationale: Minimizes storage costs and reduces exposure risks.

## Core Content

### 1. **Sanitize Logs to Avoid Sensitive Data**
   - Use logging frameworks with built-in sanitization features (e.g., SLF4J, Log4j, Serilog).  
   - Regularly audit log outputs for accidental inclusion of secrets or sensitive data.  
   - Mask sensitive fields in log messages (e.g., replace passwords with `***`).

### 2. **Implement Correlation IDs**
   - Generate a unique correlation ID for every request (e.g., UUID).  
   - Pass correlation IDs across service boundaries (e.g., via HTTP headers).  
   - Include correlation IDs in all log messages related to the request.  
   - Use middleware or interceptors to automate correlation ID handling.

### 3. **Include Audit Fields**
   - Log timestamps in ISO 8601 format for consistency (e.g., `2023-10-15T14:23:00Z`).  
   - Include user identifiers (e.g., user ID or session ID) to track actions.  
   - Record action types (e.g., `CREATE`, `UPDATE`, `DELETE`) for clarity.  
   - Ensure audit logs are immutable and tamper-proof.

### 4. **Configure Log Levels**
   - Use `DEBUG` for detailed development logs; avoid using it in production.  
   - Use `INFO` for general application events (e.g., startup, shutdown).  
   - Use `WARN` for recoverable issues; `ERROR` for critical failures.  
   - Regularly review log level configurations to ensure relevance.

### 5. **Secure Log Storage**
   - Encrypt log files using AES-256 or similar encryption standards.  
   - Use access controls to restrict log file access (e.g., role-based permissions).  
   - Rotate log files regularly (e.g., daily or based on size thresholds).  
   - Implement a log retention policy (e.g., retain logs for 90 days, then archive or delete).

### 6. **Monitor and Review Logs**
   - Use log aggregation tools (e.g., ELK Stack, Splunk) for centralized log management.  
   - Set up alerts for suspicious log entries (e.g., repeated failed login attempts).  
   - Regularly review logs for anomalies or patterns indicating security incidents.

## Links
- **OWASP Logging Cheat Sheet**: Best practices for secure logging in web applications.  
- **NIST SP 800-92**: Guidelines for computer security log management.  
- **PCI DSS Logging Requirements**: Standards for logging in payment systems.  
- **ISO 27001 Controls**: Logging-related controls for information security management.

## Proof / Confidence
- **OWASP** recommends avoiding sensitive data in logs and using correlation IDs for traceability.  
- **PCI DSS** mandates secure logging practices for systems handling payment data.  
- **NIST SP 800-92** highlights the importance of audit fields for forensic investigations.  
- Industry benchmarks (e.g., ELK Stack, Splunk) emphasize log sanitization, encryption, and monitoring as common practices.
