---
kid: "KID-ITGOV-CHECK-0001"
title: "Data Handling Checklist (retention, redaction)"
type: checklist
pillar: IT_END_TO_END
domains:
  - platform_ops
  - compliance_governance
subdomains: []
tags: [governance, data-handling, retention, redaction]
maturity: "reviewed"
use_policy: reusable_with_allowlist
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Data Handling Checklist (retention, redaction)

```markdown
# Data Handling Checklist (Retention, Redaction)

## Summary
This checklist provides actionable steps for managing data retention and redaction within platform operations to ensure compliance with governance policies and regulatory requirements. Proper data handling minimizes risks related to data breaches, unauthorized access, and non-compliance with legal standards.

## When to Use
- When designing or updating data storage, processing, or archival systems.
- During audits or reviews of compliance with data retention and redaction policies.
- When implementing new features or applications that handle sensitive or regulated data.
- Prior to decommissioning systems that store or process sensitive data.

## Do / Don't
### Do:
1. **Do classify data based on sensitivity and regulatory requirements.**  
   Rationale: Ensures appropriate retention and redaction policies are applied.
2. **Do implement automated retention policies in data storage systems.**  
   Rationale: Reduces human error and ensures consistent compliance.
3. **Do redact personal or sensitive data in logs and backups.**  
   Rationale: Prevents exposure of sensitive information in non-production environments.

### Don't:
1. **Don’t retain data longer than necessary without a documented business or compliance need.**  
   Rationale: Avoids unnecessary risks and reduces storage costs.
2. **Don’t store unencrypted sensitive data in any environment.**  
   Rationale: Protects against unauthorized access and data breaches.
3. **Don’t rely solely on manual processes for data redaction or deletion.**  
   Rationale: Manual processes are error-prone and may lead to non-compliance.

## Core Content
### Data Retention
1. **Define Retention Policies**  
   - Identify regulatory requirements (e.g., GDPR, HIPAA, CCPA) and business needs for data retention.  
   - Document retention periods for all data types (e.g., customer data, logs, backups).  
   - Ensure policies are approved by compliance and legal teams.  

2. **Automate Retention Enforcement**  
   - Use lifecycle management tools in cloud storage (e.g., AWS S3 Lifecycle Policies, Azure Blob Storage lifecycle management).  
   - Configure database systems to automatically purge data beyond the retention period.  
   - Schedule regular reviews of retention configurations to ensure alignment with policies.

3. **Audit Retention Practices**  
   - Conduct periodic audits to verify that data is being deleted or archived according to policies.  
   - Maintain logs of data deletion activities for accountability and compliance reporting.

### Data Redaction
1. **Redact Sensitive Data in Logs**  
   - Mask or remove sensitive information (e.g., PII, payment data) from application and system logs.  
   - Use logging libraries or tools that support redaction (e.g., Logstash filters, DataDog scrubbing).  
   - Regularly review logs for unredacted sensitive data.

2. **Redact Data in Non-Production Environments**  
   - Replace sensitive data with anonymized or synthetic data in development, testing, and staging environments.  
   - Use data masking tools (e.g., Delphix, Informatica) to automate redaction.  
   - Validate that no sensitive data is exposed during testing.

3. **Secure Backup Redaction**  
   - Encrypt backups containing sensitive data.  
   - Implement redaction workflows to remove sensitive information from backups where possible.  
   - Regularly review backup policies to ensure compliance with retention and redaction standards.

### General Best Practices
- **Document Everything:** Maintain clear documentation for all retention and redaction policies and procedures.  
- **Train Teams:** Provide training for engineers and platform operators on data handling best practices.  
- **Monitor and Alert:** Use monitoring tools to detect and alert on policy violations (e.g., unencrypted data, expired retention periods).  

## Links
- **GDPR Compliance Guidelines:** Overview of EU General Data Protection Regulation requirements.  
- **NIST Data Protection Framework:** Best practices for data security and handling.  
- **OWASP Logging Cheat Sheet:** Guidance on secure logging practices.  
- **ISO 27001 Data Retention Standards:** International standards for information security management.

## Proof / Confidence
This checklist is based on widely accepted industry standards, including GDPR, HIPAA, and ISO 27001, as well as best practices from leading cloud providers (AWS, Azure, GCP). Automated retention and redaction practices are supported by benchmarks from NIST and OWASP, which emphasize the importance of consistency, encryption, and monitoring in data handling.
```
