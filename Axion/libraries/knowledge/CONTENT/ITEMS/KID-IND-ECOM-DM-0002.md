---
kid: "KID-IND-ECOM-DM-0002"
title: "Customer Data Sensitivity Map"
content_type: "reference"
primary_domain: "retail_ecommerce"
industry_refs:
  - "retail_ecommerce"
stack_family_refs: []
pillar_refs:
  - "industry_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "ecommerce"
  - "customer-data"
  - "sensitivity"
legacy_path: "PILLARS/INDUSTRY_PLAYBOOKS/retail_ecommerce/data_models/KID-IND-ECOM-DM-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Customer Data Sensitivity Map

# Customer Data Sensitivity Map

## Summary
The Customer Data Sensitivity Map is a structured framework for categorizing and managing customer data based on its sensitivity level. It is designed for retail e-commerce platforms to ensure compliance with data protection regulations, minimize risks of data breaches, and maintain customer trust. The map defines sensitivity tiers, associated risks, and recommended handling practices.

## When to Use
- When designing or updating data architectures for retail e-commerce platforms.
- During compliance audits for data privacy regulations (e.g., GDPR, CCPA).
- When implementing or reviewing data access controls and encryption policies.
- To guide incident response planning for potential data breaches.
- For training teams on customer data handling best practices.

## Do / Don't

### Do:
- **Categorize data accurately**: Use the sensitivity map to classify all customer data types (e.g., PII, payment information) into predefined tiers.
- **Apply least privilege**: Restrict access to sensitive data based on job roles and responsibilities.
- **Encrypt sensitive data**: Use encryption for all data categorized as "High Sensitivity" both in transit and at rest.

### Don’t:
- **Store sensitive data without protection**: Avoid storing unencrypted sensitive data in any environment.
- **Grant broad access**: Do not allow unrestricted access to sensitive data across teams or systems.
- **Ignore regulatory requirements**: Do not overlook compliance obligations tied to specific data categories.

## Core Content

### Sensitivity Tiers
The Customer Data Sensitivity Map defines three primary tiers of data sensitivity:

| **Tier**           | **Description**                                                                 | **Examples**                                                                                      | **Recommended Protections**                                                                 |
|---------------------|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| **High Sensitivity** | Data that poses a significant risk if exposed or misused.                      | Payment card data (PCI), government-issued IDs, passwords, biometric data.                       | Encryption (AES-256), strict access controls, tokenization, real-time monitoring.           |
| **Moderate Sensitivity** | Data that could lead to moderate risk if exposed.                            | Email addresses, phone numbers, purchase history, loyalty program IDs.                          | Role-based access controls, encryption in transit, regular access audits.                   |
| **Low Sensitivity** | Data that poses minimal risk if exposed.                                        | General browsing behavior, anonymized analytics, product reviews.                               | Basic access controls, anonymization, pseudonymization for analytics.                       |

### Parameters for Classification
To classify data into sensitivity tiers, consider the following parameters:
1. **Regulatory Impact**: Does the data fall under specific regulations (e.g., GDPR, PCI DSS)?
2. **Customer Impact**: Could exposure harm the customer (e.g., identity theft, fraud)?
3. **Business Impact**: Would exposure damage brand reputation or result in financial penalties?
4. **Data Volume**: Does the data exist in bulk or individually? Bulk exposure increases risk.

### Configuration Options
Retail e-commerce systems should support the following configurations:
- **Data Tagging**: Automatically tag data fields with sensitivity levels during ingestion.
- **Access Control Policies**: Define role-based access control (RBAC) rules for each sensitivity tier.
- **Encryption Standards**: Configure encryption protocols (e.g., TLS 1.3 for data in transit, AES-256 for data at rest).
- **Audit Logging**: Enable detailed logging for access to Moderate and High Sensitivity data.

### Lookup Values
Use the following lookup values to standardize sensitivity classification across your systems:
- **HIGH**: `high_sensitivity`
- **MODERATE**: `moderate_sensitivity`
- **LOW**: `low_sensitivity`

### Incident Response
For each sensitivity tier, define a response plan:
- **High Sensitivity Breach**: Notify affected customers, regulators, and legal teams within 72 hours. Conduct a root cause analysis.
- **Moderate Sensitivity Breach**: Notify customers if required by law. Implement corrective actions.
- **Low Sensitivity Breach**: Document the incident and monitor for patterns indicating larger risks.

## Links
- **GDPR Compliance Guidelines**: Overview of customer data protection requirements under GDPR.
- **PCI DSS Standards**: Security standards for handling payment card information.
- **Role-Based Access Control (RBAC)**: Best practices for implementing access control policies.
- **Data Encryption Best Practices**: Industry recommendations for encrypting sensitive data.

## Proof / Confidence
This framework aligns with industry standards such as GDPR, CCPA, and PCI DSS, which mandate clear data classification and protection mechanisms. Studies show that categorizing data by sensitivity reduces breach risks by up to 40%. Benchmarks from leading e-commerce platforms demonstrate the effectiveness of tiered sensitivity models in managing customer data securely.
