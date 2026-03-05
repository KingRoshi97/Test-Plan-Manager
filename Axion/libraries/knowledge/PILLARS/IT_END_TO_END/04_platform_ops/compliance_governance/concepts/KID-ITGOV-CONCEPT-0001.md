---
kid: "KID-ITGOV-CONCEPT-0001"
title: "Data Classification Basics (PII, secrets, internal)"
type: concept
pillar: IT_END_TO_END
domains:
  - platform_ops
  - compliance_governance
subdomains: []
tags: [governance, data-classification, pii, secrets]
maturity: "reviewed"
use_policy: pattern_only
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

# Data Classification Basics (PII, secrets, internal)

# Data Classification Basics (PII, Secrets, Internal)

## Summary
Data classification is the process of categorizing data based on its sensitivity, value, and regulatory requirements. Common classifications include Personally Identifiable Information (PII), secrets (e.g., passwords, API keys), and internal data (e.g., company communications). Proper classification ensures that data is appropriately protected, reduces compliance risks, and supports operational efficiency.

---

## When to Use
- When designing or auditing data storage and access controls.
- When implementing compliance frameworks such as GDPR, CCPA, or HIPAA.
- During software development to ensure sensitive data is not exposed in logs, repositories, or APIs.
- When creating or updating data governance policies.
- During incident response to assess the impact of data breaches based on the classification of exposed data.

---

## Do / Don't

### Do:
1. **Classify data at creation**: Assign a classification label (e.g., PII, secrets, internal) as soon as data is created or ingested.
2. **Use automated tools**: Leverage tools like DLP (Data Loss Prevention) or cloud-native classification services to identify sensitive data.
3. **Regularly review classifications**: Periodically audit data classifications to ensure they remain accurate as data usage and regulatory requirements evolve.

### Don't:
1. **Store secrets in plaintext**: Avoid storing sensitive data like API keys, passwords, or tokens in plaintext or unprotected locations.
2. **Ignore regulatory requirements**: Do not assume that internal classifications are sufficient for compliance; always align with applicable laws and standards.
3. **Overclassify data**: Avoid labeling all data as "sensitive" or "internal," as this can lead to inefficiencies and unnecessary costs.

---

## Core Content

### What Is Data Classification?
Data classification is the process of organizing data into categories based on its sensitivity, criticality, and compliance requirements. This process enables organizations to apply appropriate security controls, manage access, and comply with regulations. Common classifications include:

- **PII (Personally Identifiable Information):** Data that can identify an individual, such as names, email addresses, Social Security numbers, or IP addresses. Protecting PII is critical for compliance with privacy laws like GDPR and CCPA.
- **Secrets:** Highly sensitive data, such as passwords, encryption keys, API tokens, and certificates. Secrets must be stored securely (e.g., in a secrets management tool) to prevent unauthorized access.
- **Internal Data:** Information intended for internal use only, such as internal emails, strategy documents, or non-public financial data. While less sensitive than PII or secrets, internal data still requires protection to prevent reputational or operational risks.

### Why Does Data Classification Matter?
1. **Security:** Classification helps organizations prioritize security controls based on the sensitivity of the data. For example, PII may require encryption and access logging, while internal data may only need basic access controls.
2. **Compliance:** Many regulations mandate specific protections for sensitive data. Proper classification ensures compliance with laws like GDPR, HIPAA, or PCI DSS.
3. **Operational Efficiency:** By categorizing data, organizations can streamline access management, reduce storage costs, and focus resources on protecting high-risk data.

### How Does It Fit Into Platform Operations and Compliance Governance?
In the **platform operations** domain, data classification ensures that systems are designed and maintained with appropriate controls for sensitive data. For example, secrets should never be hardcoded into application code or stored in source control repositories. Instead, they should be managed using a secure secrets management solution like AWS Secrets Manager or HashiCorp Vault.

In the **compliance governance** domain, data classification supports the development and enforcement of policies that align with regulatory requirements. For instance, a governance policy might mandate encryption for all PII stored in databases or require regular audits of access permissions for internal data.

### Practical Examples
1. **PII Example:** A customer database containing names, email addresses, and phone numbers must be encrypted at rest and in transit. Access should be restricted to authorized personnel only.
2. **Secrets Example:** API keys for third-party integrations should be stored in a secrets management tool and retrieved programmatically at runtime, rather than being hardcoded into the application.
3. **Internal Data Example:** An internal product roadmap document should be stored in a secure file-sharing platform with access limited to employees.

---

## Links
- **Data Loss Prevention (DLP):** Tools and techniques for identifying and protecting sensitive data.
- **GDPR Compliance Overview:** Key requirements for protecting PII under the General Data Protection Regulation.
- **Secrets Management Best Practices:** Guidelines for securely storing and managing sensitive credentials.
- **Zero Trust Security Model:** A security framework that enforces strict access controls based on data sensitivity.

---

## Proof / Confidence
This content is based on industry standards and best practices, including:
- **NIST SP 800-53:** Guidelines for implementing security and privacy controls, including data classification.
- **ISO/IEC 27001:** International standard for information security management, which emphasizes data classification as a core practice.
- **OWASP Top Ten (2023):** Highlights risks like sensitive data exposure, underscoring the importance of proper classification and protection.
- **Cloud Provider Best Practices:** AWS, Azure, and Google Cloud provide tools and documentation for data classification and protection.
