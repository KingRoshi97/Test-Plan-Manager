---
kid: "KID-ITCOST-PITFALL-0002"
title: "Unbounded logs/metrics bills"
type: pitfall
pillar: IT_END_TO_END
domains:
  - platform_ops
  - finops_cost
subdomains: []
tags: [finops, logging, metrics, cost-overrun]
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

# Unbounded logs/metrics bills

# Unbounded Logs/Metrics Bills

## Summary
Unbounded logs and metrics ingestion can lead to runaway costs in cloud environments. This pitfall occurs when logs or metrics are collected, stored, or processed without proper limits or retention policies, resulting in unexpectedly high bills. This issue often stems from misconfigured monitoring systems, lack of cost controls, or insufficient understanding of data retention policies. Addressing this problem requires proactive monitoring, clear policies, and cost optimization practices.

---

## When to Use
This pitfall applies in the following scenarios:
- **Cloud-based Monitoring and Logging Systems**: Using services such as AWS CloudWatch, Azure Monitor, Google Cloud Logging, or third-party tools like Datadog, Splunk, or New Relic.
- **High-Traffic Applications**: Applications generating large volumes of logs or metrics, such as microservices architectures or event-driven systems.
- **Dynamic Scaling Environments**: Environments where services scale up/down automatically, potentially increasing log/metric volume unpredictably.
- **Long-Term Retention Requirements**: When compliance or business needs require retaining logs/metrics for extended periods without cost-effective storage strategies.

---

## Do / Don't

### Do:
- **Set Retention Policies**: Configure retention periods for logs/metrics to automatically delete old data.
- **Enable Sampling or Filtering**: Reduce the volume of data ingested by sampling metrics or filtering unnecessary logs.
- **Monitor Costs Proactively**: Use cost monitoring tools to track and alert on logging/metrics expenses.

### Don't:
- **Store Everything Indefinitely**: Avoid retaining logs or metrics without a defined retention period.
- **Ignore Data Volume Growth**: Failing to account for application growth can lead to exponential cost increases.
- **Disable Cost Alerts**: Never operate without alerts for unexpected cost spikes in logging/metrics services.

---

## Core Content

Unbounded logs and metrics bills occur when monitoring systems collect and store data without limits, leading to uncontrolled cost growth. This pitfall is common in cloud environments where services charge based on data volume ingested, stored, or queried. For example, AWS CloudWatch charges per GB of ingested logs and per query execution, while Datadog charges based on the number of metrics and logs ingested.

### Why This Happens
1. **Default Configurations**: Many monitoring tools default to collecting all logs and metrics without retention limits.
2. **Lack of Awareness**: Teams may not fully understand the cost implications of their logging/metrics configurations.
3. **Over-Instrumentation**: Developers may over-instrument applications, generating excessive logs or metrics.
4. **Scaling Effects**: As applications scale, the volume of logs and metrics can grow exponentially without proactive controls.

### Consequences
- **Runaway Costs**: Unchecked log/metric ingestion can lead to thousands or even millions of dollars in unexpected bills.
- **Operational Inefficiency**: Excessive data can overwhelm monitoring tools, making it harder to extract meaningful insights.
- **Budget Overruns**: Unplanned expenses can strain budgets and impact other critical projects.

### How to Detect It
1. **Cost Spikes**: Use cloud cost management tools to detect sudden increases in logging/metrics expenses.
2. **High Data Volume**: Monitor the volume of logs and metrics ingested, stored, and queried.
3. **Alert Fatigue**: Excessive logging can lead to too many alerts, reducing operational efficiency.

### How to Fix or Avoid It
1. **Audit Logs and Metrics**: Regularly review what data is being collected and whether it’s necessary.
2. **Set Retention Policies**: Configure retention periods to automatically delete old data. For example, in AWS CloudWatch, set log groups to retain data for 30 days instead of indefinitely.
3. **Use Sampling and Filtering**: Implement sampling for high-frequency metrics and filtering for redundant logs. For instance, only log errors or critical events in production environments.
4. **Leverage Cold Storage**: Move long-term logs/metrics to cheaper storage options like AWS S3 or Google Cloud Archive.
5. **Automate Alerts**: Set up alerts for unusual cost increases in logging/metrics services.

### Real-World Scenario
A SaaS company using AWS CloudWatch for monitoring experienced a sudden 300% increase in their monthly bill. Investigation revealed that a new feature generated debug-level logs for every API request, which were being retained indefinitely. The team resolved the issue by:
- Filtering out debug logs in production.
- Setting a 7-day retention policy for non-critical logs.
- Enabling cost alerts to catch future anomalies early.

---

## Links
- **Cloud Cost Management Best Practices**: Guidance on managing cloud costs effectively.
- **AWS CloudWatch Pricing Documentation**: Detailed pricing information for AWS CloudWatch services.
- **Log Management Strategies**: Overview of effective log management techniques.
- **FinOps Foundation Framework**: Industry standards for cloud financial management.

---

## Proof / Confidence
This pitfall is well-documented in industry best practices and cloud provider documentation. For example:
- The **FinOps Foundation** emphasizes the importance of setting cost controls for monitoring services.
- AWS, Google Cloud, and Azure all recommend retention policies and sampling to manage costs.
- Case studies from organizations like Netflix and Lyft highlight the financial impact of unbounded logs/metrics and the effectiveness of proactive cost management.
