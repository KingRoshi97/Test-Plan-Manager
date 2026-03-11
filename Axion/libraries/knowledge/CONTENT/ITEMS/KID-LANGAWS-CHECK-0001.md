---
kid: "KID-LANGAWS-CHECK-0001"
title: "Aws Production Readiness Checklist"
content_type: "checklist"
primary_domain: "aws"
industry_refs: []
stack_family_refs:
  - "aws"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "aws"
  - "checklist"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/05_cloud_and_devops_tooling/aws/checklists/KID-LANGAWS-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Aws Production Readiness Checklist

```markdown
# AWS Production Readiness Checklist

## Summary
This checklist ensures that your AWS-based application is production-ready by evaluating its architecture, security, scalability, monitoring, and operational processes. Following these steps minimizes downtime, enhances performance, and ensures compliance with best practices for running workloads on AWS.

## When to Use
- Before deploying a new application or service to production on AWS.
- When performing a periodic review of existing production workloads.
- After significant architectural or code changes to an AWS-based application.
- During pre-launch readiness reviews for critical releases.

## Do / Don't
### Do
- **Do enable AWS CloudTrail** for auditing API activity across your AWS account.
- **Do configure Auto Scaling Groups** to handle traffic spikes automatically.
- **Do enforce IAM least privilege** by granting only the permissions required for each role or user.
- **Do implement health checks** for all load-balanced services.
- **Do use AWS Trusted Advisor** to identify cost, security, and performance optimizations.

### Don't
- **Don't hardcode AWS credentials** in your code; use IAM roles or AWS Secrets Manager instead.
- **Don't ignore AWS Service Limits**; monitor and request limit increases proactively.
- **Don't deploy without monitoring**; ensure CloudWatch metrics and alarms are in place.
- **Don't expose sensitive data** in S3 buckets; use bucket policies and encryption.
- **Don't neglect backups**; automate backups with AWS Backup or custom scripts.

## Core Content
### Security
1. **Enable Multi-Factor Authentication (MFA) for root and IAM users**  
   Rationale: Prevent unauthorized access to your AWS account in case of compromised credentials.
2. **Encrypt data at rest and in transit**  
   - Use AWS Key Management Service (KMS) for managing encryption keys.
   - Enable HTTPS for all endpoints using AWS Certificate Manager (ACM).
   Rationale: Protect sensitive data from unauthorized access or interception.
3. **Review and rotate IAM access keys regularly**  
   Rationale: Reduces the risk of long-term credential exposure.

### Scalability and Performance
4. **Use Elastic Load Balancing (ELB) and Auto Scaling Groups**  
   - Configure scaling policies based on CPU, memory, or custom metrics.
   Rationale: Ensures high availability during traffic spikes or failures.
5. **Optimize database performance**  
   - Use Amazon RDS or DynamoDB with appropriate instance types and indexing.
   - Enable read replicas or caching layers (e.g., Amazon ElastiCache).
   Rationale: Prevents bottlenecks and ensures low-latency responses.

### Monitoring and Logging
6. **Set up CloudWatch Alarms and Dashboards**  
   - Monitor key metrics like CPU utilization, memory usage, and disk I/O.
   - Configure alarms to notify your team via Amazon SNS.
   Rationale: Enables proactive issue detection and response.
7. **Enable AWS CloudTrail and VPC Flow Logs**  
   Rationale: Provides a detailed audit trail for troubleshooting and compliance.
8. **Centralize logs with AWS CloudWatch Logs or a third-party tool**  
   Rationale: Simplifies debugging and ensures you meet compliance requirements.

### Resilience and Disaster Recovery
9. **Implement Multi-AZ deployments for critical services**  
   - Use Multi-AZ for RDS, DynamoDB global tables, and EC2 instances.
   Rationale: Ensures high availability and fault tolerance.
10. **Test disaster recovery procedures regularly**  
    - Simulate failures and validate your recovery time objectives (RTO).
    Rationale: Ensures your team is prepared for real-world incidents.

### Cost Optimization
11. **Use Reserved Instances or Savings Plans for predictable workloads**  
    Rationale: Reduces costs for long-running services.
12. **Tag resources for cost allocation**  
    - Use AWS Cost Explorer to analyze spending by tags.
    Rationale: Improves visibility and accountability for AWS expenses.

## Links
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) — A comprehensive guide to AWS best practices.
- [AWS Trusted Advisor](https://aws.amazon.com/premiumsupport/trustedadvisor/) — Tool for cost optimization, security, and performance insights.
- [AWS Security Best Practices](https://docs.aws.amazon.com/general/latest/gr/aws-security-best-practices.html) — Official guidelines for securing AWS workloads.
- [AWS Cost Optimization Guide](https://aws.amazon.com/pricing/cost-optimization/) — Practical tips for reducing AWS costs.

## Proof / Confidence
This checklist aligns with the [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) and industry best practices. The recommended actions are widely adopted by leading organizations to ensure secure, scalable, and cost-effective AWS workloads. Regular audits using tools like AWS Trusted Advisor and CloudWatch further validate production readiness.
```
