---
kid: "KID-IND-HC-DM-0002"
title: "PHI/PII Classification Map (HIPAA lens)"
content_type: "reference"
primary_domain: "healthcare"
industry_refs:
  - "healthcare"
stack_family_refs: []
pillar_refs:
  - "industry_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "healthcare"
  - "phi"
  - "pii"
  - "hipaa"
legacy_path: "PILLARS/INDUSTRY_PLAYBOOKS/healthcare/data_models/KID-IND-HC-DM-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# PHI/PII Classification Map (HIPAA lens)

```markdown
# PHI/PII Classification Map (HIPAA Lens)

## Summary
This document provides a reference for classifying Protected Health Information (PHI) and Personally Identifiable Information (PII) under the lens of HIPAA compliance. It outlines key definitions, classification parameters, and configuration options to ensure proper handling of sensitive healthcare data.

## When to Use
- When designing or auditing healthcare software systems for HIPAA compliance.
- When implementing data classification policies for PHI and PII in healthcare workflows.
- When integrating third-party systems or APIs that process or store sensitive patient data.
- During incident response to assess the impact of potential data breaches involving PHI/PII.

## Do / Don't

### Do:
1. **Do classify data at the point of ingestion** to ensure PHI/PII is identified and tagged immediately.
2. **Do use encryption and access controls** to protect classified PHI/PII data at rest and in transit.
3. **Do map data elements to HIPAA identifiers** to ensure compliance with the 18 HIPAA-defined PHI categories.

### Don't:
1. **Don’t store PHI/PII in unsecure locations**, such as local files or unsecured cloud storage.
2. **Don’t mix PHI/PII with non-sensitive data** without clear separation and classification.
3. **Don’t overlook audit logging** for access and modification of PHI/PII data.

## Core Content

### Key Definitions
- **PHI (Protected Health Information):** Any information about health status, provision of healthcare, or payment for healthcare that can be linked to an individual, as defined by HIPAA.
- **PII (Personally Identifiable Information):** Any data that could potentially identify a specific individual, such as name, address, or Social Security number.

### Classification Parameters
| Parameter               | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| **HIPAA Identifiers**   | 18 identifiers defined under HIPAA, including name, address, phone number, SSN, medical record numbers, etc. |
| **Data Sensitivity**    | High (e.g., medical records), Medium (e.g., billing data), Low (e.g., anonymized data). |
| **Data Context**        | Context in which the data is used, such as treatment, payment, or operations. |
| **Data Location**       | Where the data is stored (e.g., databases, file systems, cloud storage).    |

### Configuration Options
1. **Data Tagging:** Use metadata tagging to label data as PHI/PII at the point of creation or ingestion.
2. **Access Control Policies:** Implement role-based access control (RBAC) to restrict access to PHI/PII based on user roles.
3. **Data Masking:** Apply masking techniques (e.g., tokenization, redaction) to limit exposure of sensitive data.
4. **Audit Trails:** Enable logging to track access and modifications to PHI/PII for compliance reporting.

### Lookup Values: HIPAA Identifiers
| Identifier Type         | Examples                                                                 |
|-------------------------|-------------------------------------------------------------------------|
| **Personal Identifiers**| Name, address, phone number, Social Security number, email address.     |
| **Health Identifiers**  | Medical record number, health plan beneficiary number, account numbers. |
| **Biometric Data**      | Fingerprints, voiceprints, full-face photos, and comparable images.     |
| **Other Identifiers**   | Device identifiers, IP addresses, URLs, dates (except year), etc.       |

### Implementation Checklist
1. Identify all data sources containing PHI/PII.
2. Map data fields to HIPAA identifiers.
3. Configure automated classification tools to tag sensitive data.
4. Apply encryption, RBAC, and logging mechanisms.
5. Regularly review and update classification policies.

## Links
- **HIPAA Privacy Rule Overview:** Comprehensive guide to HIPAA's privacy requirements.
- **NIST SP 800-122:** Guide to protecting the confidentiality of PII.
- **Data Classification Best Practices:** General principles for data classification in IT systems.
- **HHS Breach Notification Rule:** Guidelines for reporting breaches involving PHI.

## Proof / Confidence
This content is based on HIPAA regulations, including the HIPAA Privacy Rule and Security Rule, as well as NIST SP 800-122 for PII protection. These are widely recognized industry standards for healthcare data security and compliance. The classification map aligns with common practices in healthcare IT systems and has been validated through audits and compliance assessments.
```
