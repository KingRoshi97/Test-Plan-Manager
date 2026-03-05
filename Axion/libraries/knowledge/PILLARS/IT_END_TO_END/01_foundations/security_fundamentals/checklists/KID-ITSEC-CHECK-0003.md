---
kid: "KID-ITSEC-CHECK-0003"
title: "Data Handling Checklist (PII, retention, redaction)"
type: "checklist"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "checklist"
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

# Data Handling Checklist (PII, retention, redaction)

# Data Handling Checklist (PII, Retention, Redaction)

## Summary
This checklist provides actionable steps for securely handling Personally Identifiable Information (PII), ensuring proper data retention practices, and implementing redaction techniques. It is designed to help software engineers and IT professionals comply with security fundamentals and reduce risks associated with sensitive data exposure.

## When to Use
- When designing or reviewing systems that process, store, or transmit PII.
- During audits or assessments of data security practices.
- When implementing or updating data retention policies.
- Before sharing datasets externally or exposing data in logs, reports, or APIs.

## Do / Don't

### Do:
1. **Encrypt PII at rest and in transit** to protect against unauthorized access.
2. **Implement access controls** to ensure only authorized personnel can access sensitive data.
3. **Define and enforce data retention policies** based on regulatory requirements and business needs.
4. **Redact sensitive data in logs and reports** before sharing or storing them in non-secure environments.
5. **Regularly audit data handling practices** to identify and mitigate vulnerabilities.

### Don't:
1. **Store PII indefinitely** without a clear retention policy or justification.
2. **Expose raw PII in logs, error messages, or debugging outputs**.
3. **Use weak or outdated encryption algorithms** (e.g., MD5 or SHA-1) for sensitive data.
4. **Ignore regulatory requirements** like GDPR, CCPA, or HIPAA when handling PII.
5. **Assume default configurations are secure** without reviewing and customizing them.

## Core Content

### PII Handling
1. **Identify PII:** Maintain an inventory of all data fields considered PII (e.g., names, addresses, phone numbers, social security numbers). Use data classification tools to automate this process.
   - *Rationale:* Knowing what constitutes PII is critical to applying appropriate protections.
2. **Encrypt PII:** Use AES-256 or stronger encryption for data at rest and TLS 1.2+ for data in transit. Verify encryption keys are securely stored and rotated periodically.
   - *Rationale:* Encryption ensures data confidentiality even if systems are compromised.
3. **Mask or tokenize PII:** Replace sensitive data with non-sensitive placeholders when full access is unnecessary.
   - *Rationale:* Reduces exposure while preserving functionality for testing or analytics.

### Retention Practices
1. **Define retention periods:** Specify how long PII should be stored based on legal and business requirements. Automate data deletion processes where possible.
   - *Rationale:* Minimizing data storage reduces exposure risk and ensures compliance.
2. **Monitor retention compliance:** Use logging and alerts to track adherence to retention policies.
   - *Rationale:* Ensures policies are consistently enforced and helps identify violations.
3. **Securely delete data:** Use secure wiping techniques (e.g., DoD 5220.22-M standard) to ensure deleted data cannot be recovered.
   - *Rationale:* Prevents unauthorized recovery of sensitive data.

### Redaction Techniques
1. **Redact PII in logs:** Use automated tools to scrub sensitive data before logs are stored or transmitted. For example, replace credit card numbers with "XXXX-XXXX-XXXX-1234."
   - *Rationale:* Logs are often shared or stored in less secure environments, making them a common attack vector.
2. **Remove unnecessary data:** Before sharing datasets externally, strip out fields not required for the intended use case.
   - *Rationale:* Reduces the risk of accidental exposure.
3. **Test redaction methods:** Validate redaction processes by attempting to recover original data from redacted outputs.
   - *Rationale:* Ensures redaction is effective and irreversible.

## Links
- **NIST Special Publication 800-122:** Guidelines for protecting the confidentiality of PII.
- **GDPR Compliance Overview:** Key requirements for handling PII under the General Data Protection Regulation.
- **OWASP Data Protection Cheat Sheet:** Best practices for securing sensitive data.
- **ISO/IEC 27001:** Information security management standards.

## Proof / Confidence
This content is supported by widely accepted industry standards, including NIST SP 800-122 for PII protection, GDPR and CCPA regulations for data retention, and OWASP guidelines for secure data handling. Encryption recommendations align with benchmarks set by NIST and ISO/IEC 27001. Redaction techniques are commonly used in security-conscious organizations to prevent sensitive data exposure in logs and reports.
