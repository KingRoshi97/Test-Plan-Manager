---
kid: "KID-ITCLOUD-CHECK-0001"
title: "Cloud Baseline Checklist (network, IAM, logging)"
content_type: "checklist"
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
  - "b"
  - "a"
  - "s"
  - "e"
  - "l"
  - "i"
  - "n"
  - "e"
  - ","
  - " "
  - "n"
  - "e"
  - "t"
  - "w"
  - "o"
  - "r"
  - "k"
  - ","
  - " "
  - "i"
  - "a"
  - "m"
  - ","
  - " "
  - "l"
  - "o"
  - "g"
  - "g"
  - "i"
  - "n"
  - "g"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/cloud_fundamentals/checklists/KID-ITCLOUD-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Cloud Baseline Checklist (network, IAM, logging)

# Cloud Baseline Checklist (network, IAM, logging)

## Summary
This checklist outlines critical actions for establishing a secure and operational baseline in cloud environments, focusing on networking, Identity and Access Management (IAM), and logging. It is designed for platform operations teams and cloud practitioners to ensure compliance, security, and observability across cloud resources.

## When to Use
Use this checklist when:
- Deploying new cloud environments or migrating workloads to the cloud.
- Conducting periodic audits of cloud configurations for security and compliance.
- Responding to incidents or preparing for certifications (e.g., SOC 2, ISO 27001).

## Do / Don't

### Do
1. **Do enforce least privilege access**: Assign IAM roles and policies based on the principle of least privilege to minimize security risks.
2. **Do enable VPC flow logs**: Capture network traffic metadata for monitoring and troubleshooting.
3. **Do configure centralized logging**: Aggregate logs from all services into a centralized logging solution for analysis and auditing.
4. **Do use network segmentation**: Design subnets and security groups to isolate workloads and minimize the blast radius of incidents.
5. **Do implement MFA for privileged accounts**: Add multi-factor authentication (MFA) to all accounts with administrative privileges.

### Don't
1. **Don't use default IAM roles or policies**: Default roles often have excessive permissions and can lead to security vulnerabilities.
2. **Don't allow unrestricted inbound traffic**: Avoid using overly permissive security group rules, such as `0.0.0.0/0` for inbound traffic.
3. **Don't disable logging for cost reasons**: Logging is vital for security and compliance; avoid turning it off even if storage costs increase.
4. **Don't hardcode credentials in code**: Use secret management tools or environment variables instead of embedding sensitive credentials directly in application code.
5. **Don't ignore unused resources**: Periodically audit cloud resources (e.g., unused security groups, IAM roles) and remove or disable them.

## Core Content

### Networking
1. **Define and enforce security group rules**:  
   - Restrict inbound and outbound traffic to specific IP ranges and ports.  
   - Rationale: Minimizes exposure to unauthorized access and reduces attack surface.

2. **Enable VPC flow logs**:  
   - Configure flow logs for all Virtual Private Cloud (VPC) subnets and send logs to a centralized logging service (e.g., CloudWatch, Azure Monitor).  
   - Rationale: Provides visibility into network traffic patterns for troubleshooting and detecting anomalies.

3. **Implement network segmentation**:  
   - Use subnets, private endpoints, and peering connections to isolate sensitive workloads.  
   - Rationale: Limits the blast radius of security incidents and improves compliance with data protection regulations.

4. **Use DNS filtering**:  
   - Configure DNS services to block known malicious domains.  
   - Rationale: Adds an additional layer of security against phishing and malware.

### Identity and Access Management (IAM)
1. **Enforce least privilege access**:  
   - Audit IAM policies regularly and remove unused permissions.  
   - Rationale: Reduces the risk of privilege escalation and unauthorized access.

2. **Enable MFA for all users**:  
   - Require multi-factor authentication for all accounts, especially those with administrative or billing access.  
   - Rationale: Protects against credential theft.

3. **Use role-based access control (RBAC)**:  
   - Assign roles based on job function and use groups for easier management.  
   - Rationale: Simplifies permission management and ensures clarity in access control.

4. **Rotate access keys and credentials**:  
   - Set up automated processes to rotate keys periodically.  
   - Rationale: Reduces the risk of compromised credentials being exploited.

### Logging
1. **Enable service-level logging**:  
   - Turn on logging for all cloud services (e.g., API Gateway, Lambda, S3, etc.).  
   - Rationale: Provides detailed insights into service usage and potential misconfigurations.

2. **Aggregate logs centrally**:  
   - Use a logging platform (e.g., ELK Stack, Splunk, Datadog) to consolidate logs from multiple cloud services.  
   - Rationale: Simplifies log analysis and ensures compliance with audit requirements.

3. **Set up log retention policies**:  
   - Define retention periods based on regulatory and business needs.  
   - Rationale: Balances cost management with compliance requirements.

4. **Enable alerting for critical log events**:  
   - Configure alerts for suspicious activities (e.g., unauthorized access attempts, unusual traffic patterns).  
   - Rationale: Enables rapid response to security incidents.

## Links
1. **Cloud Security Alliance (CSA) Best Practices**: Guidelines for securing cloud environments.  
2. **NIST Cybersecurity Framework**: Industry-standard framework for managing cybersecurity risks.  
3. **AWS Well-Architected Framework**: Best practices for building secure and reliable cloud applications.  
4. **OWASP Top Ten**: Common security risks and mitigation strategies for applications.

## Proof / Confidence
This checklist is based on widely accepted industry standards, including the NIST Cybersecurity Framework and recommendations from major cloud providers (AWS, Azure, Google Cloud). Practices such as least privilege access, centralized logging, and network segmentation are consistently cited in security benchmarks and compliance audits (e.g., SOC 2, PCI DSS).
