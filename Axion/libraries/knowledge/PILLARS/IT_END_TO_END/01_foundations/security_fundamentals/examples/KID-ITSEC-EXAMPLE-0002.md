---
kid: "KID-ITSEC-EXAMPLE-0002"
title: "Example Audit Log Event Schema"
type: "example"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "example"
maturity: "reviewed"
use_policy: "restricted_internal_only"
executor_access: "internal_only"
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

# Example Audit Log Event Schema

# Example Audit Log Event Schema

## Summary
Audit logs are critical for monitoring and securing software systems. This article provides a detailed example of an audit log event schema, illustrating how to structure log data for effective tracking, analysis, and compliance. The schema is designed to ensure consistency, clarity, and usability in security operations and incident response.

## When to Use
Use this schema when:
- Designing or implementing audit logging functionality for a software application.
- Ensuring compliance with security standards like ISO 27001, SOC 2, or GDPR.
- Investigating security incidents or tracking user activity for accountability.
- Integrating with SIEM (Security Information and Event Management) tools for real-time monitoring and analysis.

## Do / Don't

### Do:
1. **Include essential metadata**: Log timestamps, event types, user identifiers, and source IPs to ensure logs are actionable.
2. **Standardize field names**: Use consistent naming conventions to simplify parsing and integration with external tools.
3. **Use structured formats**: Prefer JSON or XML for logs to enable easy parsing and validation.

### Don't:
1. **Log sensitive data in plaintext**: Avoid including passwords, private keys, or personally identifiable information (PII) without encryption or masking.
2. **Ignore performance impacts**: Ensure logging mechanisms do not degrade application performance, especially in high-traffic systems.
3. **Overlook retention policies**: Define clear retention periods to comply with legal and regulatory requirements while managing storage costs.

## Core Content

### Scenario
A SaaS company is implementing audit logging for its web application to monitor user activity and ensure compliance with GDPR. The company needs a schema that is comprehensive, easy to parse, and compatible with their existing SIEM tool.

### Example Schema
Below is an example JSON schema for an audit log event:

```json
{
  "timestamp": "2023-10-01T12:34:56Z",
  "event_id": "abc123",
  "event_type": "USER_LOGIN",
  "actor": {
    "user_id": "user_789",
    "username": "jdoe",
    "ip_address": "192.168.1.1"
  },
  "target": {
    "resource_id": "resource_456",
    "resource_type": "DOCUMENT"
  },
  "details": {
    "success": true,
    "method": "password",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  },
  "metadata": {
    "application_id": "app_001",
    "environment": "production"
  }
}
```

### Step-by-Step Walkthrough

1. **Define critical fields**:
   - **`timestamp`**: Use ISO 8601 format for universal compatibility.
   - **`event_id`**: Assign a unique identifier to each event for traceability.
   - **`event_type`**: Categorize events (e.g., `USER_LOGIN`, `DATA_ACCESS`) for easy filtering.

2. **Actor and Target Details**:
   - Include **actor** information (e.g., `user_id`, `username`, `ip_address`) to identify who performed the action.
   - Specify **target** details (e.g., `resource_id`, `resource_type`) to understand what was affected.

3. **Event-specific details**:
   - Use the `details` field for attributes specific to the event type (e.g., login method, success status, user agent).

4. **Metadata**:
   - Add contextual information like `application_id` and `environment` to differentiate logs across systems and environments.

5. **Validation**:
   - Ensure the schema is well-formed and adheres to JSON standards. Use automated tests to verify log generation.

6. **Integration**:
   - Test the schema with the SIEM tool to confirm compatibility and ingestion efficiency.

### Key Decisions and Rationale
- **Structured format**: JSON was chosen for its readability, widespread support, and compatibility with SIEM tools.
- **Minimal sensitive data**: PII is limited to `username`, and no plaintext passwords are logged to maintain security.
- **Unique identifiers**: `event_id` ensures each log entry can be uniquely referenced during investigations.

## Links
- **ISO 27001 Logging and Monitoring Requirements**: Learn about logging best practices for compliance.
- **OWASP Logging Cheat Sheet**: Guidelines for secure and effective logging in applications.
- **GDPR Article 30**: Understand logging obligations under GDPR for data controllers and processors.
- **SIEM Integration Basics**: Explore how to integrate audit logs with SIEM tools for real-time analysis.

## Proof / Confidence
This schema follows industry standards for audit logging, as outlined by OWASP and ISO 27001. JSON is widely adopted for structured logging due to its compatibility with modern systems and tools. The schema aligns with GDPR principles by avoiding excessive data collection and ensuring traceability.
