---
kid: "KID-IND-GOV-DM-0002"
title: "Sensitive Data Classification Map (public sector)"
content_type: "reference"
primary_domain: "government_public_sector"
industry_refs:
  - "government_public_sector"
stack_family_refs: []
pillar_refs:
  - "industry_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "government"
  - "data-classification"
  - "sensitive-data"
legacy_path: "PILLARS/INDUSTRY_PLAYBOOKS/government_public_sector/data_models/KID-IND-GOV-DM-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Sensitive Data Classification Map (public sector)

```markdown
# Sensitive Data Classification Map (Public Sector)

## Summary
The Sensitive Data Classification Map is a framework designed to help public sector organizations categorize and manage sensitive data. It ensures compliance with government regulations, reduces data exposure risks, and supports secure data handling practices. This document provides key definitions, parameters, and configuration options for implementing the classification map effectively.

---

## When to Use
- When categorizing data to comply with government data protection regulations (e.g., GDPR, CCPA, or local public sector mandates).
- During the design or review of data governance policies.
- When implementing access controls, encryption, or data retention policies.
- For audits or risk assessments related to sensitive data.

---

## Do / Don't

### Do:
1. **Classify data at creation**: Assign a sensitivity level when data is created or ingested.
2. **Use predefined categories**: Follow the classification levels defined in this document to maintain consistency.
3. **Regularly review classifications**: Periodically reassess data classifications to ensure they remain accurate as data use evolves.

### Don't:
1. **Store sensitive data without encryption**: Always apply encryption to classified sensitive data in transit and at rest.
2. **Overclassify data**: Avoid assigning higher sensitivity levels than necessary, as it can lead to unnecessary restrictions and costs.
3. **Ignore user access controls**: Ensure access permissions align with the data classification level.

---

## Core Content

### Key Definitions
- **Public Data**: Information that can be freely shared without restrictions (e.g., public reports, press releases).
- **Internal Data**: Non-sensitive information intended for internal use only (e.g., internal memos, meeting notes).
- **Confidential Data**: Data that, if disclosed, could harm the organization or individuals (e.g., PII, employee records).
- **Restricted Data**: Highly sensitive data that requires the strictest controls (e.g., national security information, classified government records).

### Parameters for Classification
1. **Sensitivity Level**: Defines the risk associated with unauthorized access or disclosure.
   - Public
   - Internal
   - Confidential
   - Restricted
2. **Data Type**: The nature of the data (e.g., financial, health, operational).
3. **Access Requirements**: Defines who can access the data and under what conditions.
4. **Retention Policy**: Specifies how long data should be retained based on its classification.

### Configuration Options
- **Access Control**: Implement role-based access control (RBAC) to restrict access based on classification.
- **Encryption Standards**: 
  - Use AES-256 for Confidential and Restricted data.
  - TLS 1.2 or higher for data in transit.
- **Audit Logging**: Enable logging for access to Confidential and Restricted data to ensure traceability.
- **Data Masking**: Apply masking techniques for Confidential and Restricted data in non-production environments.

### Lookup Table: Sensitivity Levels and Controls

| Sensitivity Level | Example Data Types                     | Access Control         | Encryption Required | Retention Policy |
|--------------------|----------------------------------------|------------------------|---------------------|------------------|
| Public            | Press releases, public reports        | Open access            | No                  | As needed        |
| Internal          | Internal memos, meeting notes         | Internal employees     | Optional            | 5 years          |
| Confidential      | PII, employee records, financial data | Authorized personnel   | AES-256             | 7 years          |
| Restricted        | Classified government records         | Need-to-know basis     | AES-256             | 10+ years        |

---

## Links
- **NIST SP 800-53**: Guidelines on security and privacy controls for federal information systems.
- **ISO/IEC 27001**: International standard for information security management.
- **GDPR Overview**: Key principles of the General Data Protection Regulation for sensitive data handling.
- **Data Governance Frameworks**: Best practices for managing data in the public sector.

---

## Proof / Confidence
This classification map aligns with industry standards such as NIST SP 800-53 and ISO/IEC 27001. It reflects common practices in public sector data governance and is supported by regulatory frameworks like GDPR and CCPA. Numerous government organizations have successfully implemented similar classification systems to enhance data security and compliance.
```
