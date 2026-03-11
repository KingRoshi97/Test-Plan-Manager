---
kid: "KID-ITCLOUD-CONCEPT-0001"
title: "Shared Responsibility Model"
content_type: "concept"
primary_domain: "platform_ops"
secondary_domains:
  - "cloud_fundamentals"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "c"
  - "l"
  - "o"
  - "u"
  - "d"
  - ","
  - " "
  - "s"
  - "h"
  - "a"
  - "r"
  - "e"
  - "d"
  - "-"
  - "r"
  - "e"
  - "s"
  - "p"
  - "o"
  - "n"
  - "s"
  - "i"
  - "b"
  - "i"
  - "l"
  - "i"
  - "t"
  - "y"
  - ","
  - " "
  - "s"
  - "e"
  - "c"
  - "u"
  - "r"
  - "i"
  - "t"
  - "y"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/cloud_fundamentals/concepts/KID-ITCLOUD-CONCEPT-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Shared Responsibility Model

# Shared Responsibility Model

## Summary
The Shared Responsibility Model is a foundational concept in cloud computing that delineates the division of security and operational responsibilities between cloud service providers (CSPs) and their customers. It ensures clarity on who is accountable for specific aspects of the cloud environment, such as infrastructure security, data protection, and application management. This model is critical for maintaining secure and compliant cloud operations.

## When to Use
- When designing or deploying workloads in public, private, or hybrid cloud environments.
- During security and compliance audits to determine responsibility boundaries.
- While drafting Service Level Agreements (SLAs) or governance policies for cloud operations.
- When evaluating cloud service providers to assess their role in managing infrastructure and services.
- In incident response planning to clearly identify the responsible party for mitigation and recovery actions.

## Do / Don't

### Do:
- **Do understand your CSP's shared responsibility documentation.** Each provider (e.g., AWS, Azure, GCP) may have slight variations in their model.
- **Do ensure clear accountability for data protection.** Customers are always responsible for securing their data, regardless of the service model (IaaS, PaaS, SaaS).
- **Do implement strong identity and access management (IAM).** This is a customer responsibility and a critical layer of protection.

### Don't:
- **Don't assume the CSP handles everything.** While CSPs secure the underlying infrastructure, customers must secure their applications, data, and configurations.
- **Don't neglect compliance requirements.** Customers are responsible for ensuring their workloads meet industry and regulatory standards.
- **Don't ignore misconfigurations.** Incorrectly configured resources, such as open storage buckets, fall under customer responsibility and are a common source of breaches.

## Core Content
The Shared Responsibility Model is a framework that defines the division of operational and security responsibilities between cloud service providers (CSPs) and customers. It is integral to cloud computing because it clarifies accountability, reduces ambiguity, and helps prevent security gaps.

### Key Principles
1. **Provider Responsibility**: CSPs are responsible for securing the cloud infrastructure. This includes physical security of data centers, hardware maintenance, and the virtualization layer. For example, AWS ensures the security of its global infrastructure, including compute, storage, and networking resources.
   
2. **Customer Responsibility**: Customers are responsible for securing what they put in the cloud. This includes data, applications, operating systems, and configurations. For instance, if a customer deploys a virtual machine in Azure, they must ensure the operating system is patched, firewalls are configured, and sensitive data is encrypted.

3. **Service Model Variations**:
   - **Infrastructure as a Service (IaaS)**: Customers have the most responsibility, including managing operating systems, middleware, and applications. CSPs handle the physical infrastructure.
   - **Platform as a Service (PaaS)**: CSPs manage more, such as the runtime and middleware, while customers focus on application security and data.
   - **Software as a Service (SaaS)**: CSPs handle nearly everything except for customer data and user access controls.

### Why It Matters
Understanding the Shared Responsibility Model is essential for:
- **Security**: Misunderstanding responsibilities can lead to vulnerabilities. For example, a customer may assume their CSP encrypts stored data when it is actually their responsibility.
- **Compliance**: Regulatory frameworks like GDPR, HIPAA, and PCI DSS require clear accountability for data protection. The model ensures customers and CSPs know their respective roles.
- **Cost Optimization**: Customers can avoid unnecessary duplication of efforts by focusing on their responsibilities and leveraging CSP-provided tools and services.

### Practical Example
Consider a company using AWS S3 to store sensitive customer data. AWS secures the physical servers, networking, and storage infrastructure. However, the company is responsible for:
- Configuring bucket permissions to prevent unauthorized access.
- Encrypting data at rest and in transit.
- Monitoring access logs for suspicious activity.

If the company fails to configure permissions correctly, resulting in a data breach, the fault lies with the customer, not AWS.

## Links
- **Cloud Security Alliance (CSA)**: Guidance on shared responsibility and cloud security best practices.
- **NIST SP 800-145**: The National Institute of Standards and Technology's definition of cloud computing and responsibilities.
- **AWS Shared Responsibility Model**: Detailed documentation on AWS's approach to shared responsibilities.
- **Azure Security Documentation**: Microsoft's explanation of shared responsibilities in Azure.

## Proof / Confidence
The Shared Responsibility Model is widely accepted and implemented by major CSPs, including AWS, Microsoft Azure, and Google Cloud Platform. Industry standards such as ISO/IEC 27001 and frameworks like NIST Cybersecurity Framework emphasize the importance of clear responsibility delineation. Real-world incidents, such as breaches caused by misconfigured cloud resources, further validate the criticality of adhering to this model.
