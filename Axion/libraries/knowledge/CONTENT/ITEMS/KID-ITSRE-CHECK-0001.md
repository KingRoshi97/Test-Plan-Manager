---
kid: "KID-ITSRE-CHECK-0001"
title: "Observability Baseline Checklist"
content_type: "checklist"
primary_domain: "software_delivery"
secondary_domains:
  - "observability_sre"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "o"
  - "b"
  - "s"
  - "e"
  - "r"
  - "v"
  - "a"
  - "b"
  - "i"
  - "l"
  - "i"
  - "t"
  - "y"
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
  - "c"
  - "h"
  - "e"
  - "c"
  - "k"
  - "l"
  - "i"
  - "s"
  - "t"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/observability_sre/checklists/KID-ITSRE-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Observability Baseline Checklist

```markdown
# Observability Baseline Checklist

## Summary
This checklist provides a foundational set of actions to establish observability in software delivery systems. It ensures that teams can monitor, debug, and optimize their systems effectively. By implementing these practices, you can achieve better visibility into system health, performance, and reliability.

## When to Use
- When setting up observability for a new service or application.
- During the onboarding process for adopting observability tools and practices.
- As part of a periodic review of your system's observability readiness.
- Before or after significant architectural changes, such as migrations or scaling efforts.

## Do / Don't

### Do
1. **Do instrument code with distributed tracing libraries** to track requests across services.
2. **Do define and monitor Service Level Indicators (SLIs)** for critical user-facing operations.
3. **Do centralize logs, metrics, and traces** in a unified observability platform.
4. **Do establish alerting thresholds** based on key performance indicators (KPIs) and SLIs.
5. **Do document your observability setup** for onboarding and troubleshooting.

### Don't
1. **Don’t rely solely on logs** without integrating metrics and traces for a full picture.
2. **Don’t hardcode observability configurations**; use environment variables or configuration management tools.
3. **Don’t ignore cardinality issues** in metrics, which can lead to performance and cost problems.
4. **Don’t set overly sensitive alerts** that lead to alert fatigue.
5. **Don’t skip testing observability tools** in staging environments before production rollout.

## Core Content

### Metrics
- **Define Key Metrics**: Identify metrics that represent the health and performance of your system, such as request rate, error rate, and latency (commonly referred to as the RED metrics).
- **Use Aggregation and Labels**: Ensure metrics are aggregated meaningfully (e.g., by service, endpoint, or region) and avoid excessive cardinality in labels.
- **Set Retention Policies**: Define retention periods for metrics based on their importance (e.g., high-resolution metrics for 30 days, aggregated metrics for 1 year).

### Logging
- **Standardize Log Formats**: Use structured logging (e.g., JSON) for easier parsing and querying.
- **Centralize Logs**: Forward logs to a centralized log management system (e.g., ELK stack, Splunk) for search and analysis.
- **Log Levels**: Use appropriate log levels (e.g., DEBUG, INFO, WARN, ERROR) and avoid logging sensitive information.

### Tracing
- **Implement Distributed Tracing**: Use tracing libraries (e.g., OpenTelemetry) to propagate trace IDs across service boundaries.
- **Sample Traces**: Configure sampling rates to balance trace volume and storage costs.
- **Visualize Traces**: Ensure your tracing tool provides visualizations of request flows and bottlenecks.

### Alerting
- **Define SLOs and SLIs**: Establish Service Level Objectives (SLOs) based on SLIs to measure system reliability.
- **Set Actionable Alerts**: Create alerts for conditions that require immediate attention (e.g., error rate > 5% for 5 minutes).
- **Test Alerting Configurations**: Simulate failure scenarios to verify that alerts trigger as expected.

### Dashboards
- **Create Service-Specific Dashboards**: Tailor dashboards to provide key insights for each service or application.
- **Include High-Level and Detailed Views**: Combine system-wide overviews with detailed metrics for individual components.
- **Automate Dashboard Updates**: Use Infrastructure-as-Code (IaC) tools to version-control and deploy dashboards.

### Documentation
- **Document Observability Architecture**: Include diagrams and descriptions of how metrics, logs, and traces flow through your system.
- **Provide Playbooks**: Write playbooks for common issues, such as high latency or increased error rates.
- **Onboard New Engineers**: Maintain a guide for onboarding engineers to your observability stack.

## Links
- **Distributed Tracing with OpenTelemetry**: A guide to implementing OpenTelemetry for distributed systems.
- **Google SRE Handbook**: Best practices for defining SLIs, SLOs, and SLAs.
- **Prometheus Best Practices**: Guidelines for metrics collection and monitoring with Prometheus.
- **Log Management Fundamentals**: A comprehensive guide to structured logging and log centralization.

## Proof / Confidence
This checklist is based on industry best practices from the Google SRE Handbook, CNCF Observability Standards, and widespread adoption of tools like Prometheus, Grafana, and OpenTelemetry. These practices are validated by their ability to improve mean time to recovery (MTTR) and reduce system downtime in production environments.
```
