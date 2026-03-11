---
kid: "KID-IND-FIN-DM-0002"
title: "Sensitive Data Map (PCI-adjacent, tokens)"
content_type: "reference"
primary_domain: "finance"
industry_refs:
  - "finance"
stack_family_refs: []
pillar_refs:
  - "industry_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "finance"
  - "pci"
  - "tokens"
  - "sensitive-data"
legacy_path: "PILLARS/INDUSTRY_PLAYBOOKS/finance/data_models/KID-IND-FIN-DM-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Sensitive Data Map (PCI-adjacent, tokens)

```markdown
# Sensitive Data Map (PCI-adjacent, tokens)

## Summary
A Sensitive Data Map is a structured representation of sensitive data flows and storage locations within a system, focusing on PCI-adjacent data and tokenized information. It is critical for compliance, risk mitigation, and ensuring secure handling of financial data in accordance with industry standards.

## When to Use
- When designing or auditing systems handling payment card data or tokenized financial information.
- During PCI DSS compliance assessments to identify and document sensitive data flows.
- When implementing tokenization or encryption strategies for sensitive data management.

## Do / Don't

### Do
1. **Document all sensitive data flows**: Include storage, transmission, and processing endpoints.
2. **Apply tokenization to reduce PCI scope**: Replace sensitive data with tokens wherever possible.
3. **Regularly update the map**: Reflect changes in system architecture, data flows, or compliance requirements.

### Don't
1. **Store sensitive data without encryption**: Always encrypt PCI-adjacent data at rest and in transit.
2. **Ignore third-party integrations**: Include external systems that interact with sensitive data in the map.
3. **Assume tokenization eliminates all risk**: Tokens reduce scope but do not eliminate the need for secure handling.

## Core Content

### Key Definitions
- **PCI-adjacent data**: Data closely associated with PCI DSS compliance, such as cardholder names, expiration dates, or transaction metadata, which may not be classified as cardholder data but require secure handling.
- **Tokenization**: The process of replacing sensitive data with non-sensitive tokens that lack exploitable value outside the mapped system.
- **Sensitive Data Map**: A visual or structured representation of sensitive data flow, storage, and processing points within a system.

### Parameters to Include in the Map
1. **Data Types**: Identify PCI-adjacent data (e.g., cardholder name, transaction ID) and tokenized data.
2. **Endpoints**: Map storage locations, transmission channels, and processing systems.
3. **Security Measures**: Include encryption methods, tokenization processes, and access control mechanisms.
4. **Third-party Systems**: Document integrations with payment processors, APIs, or external services.

### Configuration Options
- **Tokenization Systems**: Choose between vault-based or vaultless tokenization based on performance and scalability needs.
- **Encryption Standards**: Use AES-256 for data at rest and TLS 1.2+ for data in transit.
- **Access Controls**: Implement role-based access control (RBAC) and audit logs for sensitive data access.

### Lookup Values
| Parameter           | Example Values                     |
|---------------------|-------------------------------------|
| Data Classification | PCI-adjacent, tokenized, encrypted |
| Encryption Method   | AES-256, RSA-2048                 |
| Tokenization Type   | Vault-based, vaultless            |
| Compliance Standard | PCI DSS v4.0, ISO 27001           |

### Best Practices
- **Minimize Sensitive Data Storage**: Retain sensitive data only when absolutely necessary and securely delete it when no longer needed.
- **Monitor Data Flows**: Use automated tools to detect anomalies or unauthorized access to sensitive data.
- **Audit Regularly**: Perform periodic reviews to ensure compliance and identify vulnerabilities.

## Links
- **PCI DSS v4.0 Overview**: Comprehensive guidelines for payment card industry compliance.
- **Tokenization Best Practices**: Industry recommendations for implementing tokenization securely.
- **ISO 27001 Framework**: International standard for information security management systems.
- **OWASP Secure Data Storage Guidelines**: Best practices for securely storing sensitive data.

## Proof / Confidence
This content is supported by established industry standards such as PCI DSS v4.0, ISO 27001, and OWASP guidelines. Tokenization and encryption methods are widely recognized as effective strategies for reducing compliance scope and securing sensitive data. Regular audits and documentation practices align with common risk management frameworks used by financial institutions globally.
```
