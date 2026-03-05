---
kid: "KID-LANGAZUR-CHECK-0001"
title: "Azure Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "azure"
subdomains: []
tags:
  - "azure"
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

# Azure Production Readiness Checklist

```markdown
# Azure Production Readiness Checklist

## Summary
This checklist ensures your Azure-based application is production-ready by validating critical aspects such as performance, security, scalability, and monitoring. Following this checklist minimizes downtime, enhances reliability, and ensures your application adheres to Azure best practices.

## When to Use
- Before deploying an application or service to a production environment in Azure.
- When conducting a production readiness review for an existing Azure application.
- After significant architectural, codebase, or infrastructure changes in your Azure environment.

## Do / Don't

### Do
- **Do** configure Azure Monitor and Application Insights for proactive monitoring and alerting.
- **Do** implement Azure Key Vault for secure management of secrets, keys, and certificates.
- **Do** enable autoscaling for compute resources such as Azure App Services and Virtual Machine Scale Sets.

### Don't
- **Don't** hardcode sensitive information like connection strings or API keys in your application code.
- **Don't** deploy to production without testing in a staging environment that mirrors production.
- **Don't** ignore Azure Advisor recommendations, as they provide actionable insights for cost, security, and performance optimization.

## Core Content

### 1. **Security**
- **Enable Azure Key Vault:** Store and manage secrets, certificates, and keys securely. Rotate keys regularly and enforce access policies using Azure Active Directory (AAD).
  - *Rationale:* Hardcoding secrets or using insecure storage increases the risk of data breaches.
- **Use Managed Identities:** Assign managed identities to Azure resources to avoid storing credentials in code.
- **Enable Network Security Groups (NSGs):** Restrict inbound and outbound traffic to Azure Virtual Networks based on IP and port rules.
- **Enforce HTTPS:** Ensure all endpoints use HTTPS to secure data in transit.

### 2. **Performance and Scalability**
- **Enable Autoscaling:** Configure autoscaling for Azure App Services, Virtual Machine Scale Sets, or Azure Kubernetes Service (AKS) to handle variable workloads.
  - *Rationale:* Autoscaling ensures your application can handle traffic spikes without manual intervention.
- **Conduct Load Testing:** Use Azure Load Testing or third-party tools to simulate production-like traffic and identify bottlenecks.
- **Use Azure Front Door or Azure CDN:** Optimize content delivery and reduce latency for global users.

### 3. **Monitoring and Logging**
- **Configure Azure Monitor:** Set up metrics, logs, and alerts for all critical resources.
- **Enable Application Insights:** Monitor application performance and track dependencies, exceptions, and telemetry data.
- **Set Up Alerts:** Define actionable alerts for key metrics like CPU usage, memory consumption, and response time.

### 4. **Resilience and Disaster Recovery**
- **Enable Backup and Restore:** Use Azure Backup or custom scripts to back up critical data and configurations.
- **Configure Geo-Redundancy:** For databases (e.g., Azure SQL, Cosmos DB), enable geo-replication to ensure high availability.
  - *Rationale:* Geo-redundancy ensures your application remains available even in the event of a regional outage.
- **Test Failover Scenarios:** Regularly test disaster recovery plans, including failover and failback processes.

### 5. **Cost Management**
- **Set Budgets and Alerts:** Use Azure Cost Management to define budgets and receive alerts when nearing thresholds.
- **Optimize Resource Usage:** Deallocate unused resources and leverage Reserved Instances for predictable workloads.
  - *Rationale:* Cost overruns can occur if resources are not monitored or optimized.

## Links
- [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/architecture/framework/): Comprehensive guidance for building reliable and secure Azure applications.
- [Azure Monitor Documentation](https://learn.microsoft.com/en-us/azure/azure-monitor/): Detailed information on setting up monitoring and alerts.
- [Azure Key Vault Best Practices](https://learn.microsoft.com/en-us/azure/key-vault/general/best-practices): Securely manage secrets, keys, and certificates.
- [Azure Load Testing](https://learn.microsoft.com/en-us/azure/load-testing/): Guide to simulate and analyze application performance under load.

## Proof / Confidence
This checklist aligns with the [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/architecture/framework/), which is widely adopted as an industry-standard for building reliable, secure, and scalable applications. Key practices, such as using Azure Monitor and Key Vault, are recommended by Microsoft and validated by real-world implementations across industries. Regular audits and adherence to these practices reduce downtime, improve security, and optimize costs, as demonstrated by case studies from Azure customers.
```
