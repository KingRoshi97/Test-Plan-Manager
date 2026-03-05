---
kid: "KID-ITSRE-CONCEPT-0002"
title: "SLO/SLI Basics"
type: concept
pillar: IT_END_TO_END
domains:
  - software_delivery
  - observability_sre
subdomains: []
tags: [observability, slo, sli, reliability]
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

# SLO/SLI Basics

# SLO/SLI Basics

## Summary
Service Level Objectives (SLOs) and Service Level Indicators (SLIs) are foundational concepts in Site Reliability Engineering (SRE) and observability practices. SLIs are quantitative metrics that measure specific aspects of a service's performance or reliability, while SLOs set target thresholds for those metrics to define acceptable service levels. Together, they enable teams to balance reliability with delivery velocity, ensuring systems meet user expectations without over-engineering.

---

## When to Use
- **Defining Service Reliability:** Use SLOs and SLIs to establish clear reliability goals for critical services, such as APIs, databases, or web applications.
- **Prioritizing Engineering Efforts:** Apply SLOs to guide decisions on whether to focus on feature development, bug fixes, or reliability improvements.
- **Incident Management:** Use SLIs to monitor service health and determine whether incidents breach agreed-upon SLOs.
- **Capacity Planning:** Leverage historical SLI data to predict trends and plan for scaling infrastructure.
- **Customer Agreements:** Use SLOs to align internal reliability goals with external Service Level Agreements (SLAs) for customers.

---

## Do / Don't

### Do:
1. **Define SLIs for User-Centric Metrics:** Focus on metrics that directly impact user experience, such as latency, availability, and error rates.
2. **Set Realistic SLO Targets:** Base SLOs on historical data and user expectations, balancing reliability with delivery speed.
3. **Monitor and Iterate:** Continuously measure SLIs and adjust SLOs as service usage or expectations evolve.

### Don’t:
1. **Overcomplicate SLIs:** Avoid tracking too many metrics; focus on a few key indicators that matter most to users.
2. **Set Unrealistic SLOs:** Don’t aim for 100% reliability unless absolutely necessary; it’s costly and often unnecessary.
3. **Ignore Breaches:** Failing to act on SLO breaches undermines their purpose and erodes trust in the system.

---

## Core Content
### What Are SLIs?
A Service Level Indicator (SLI) is a quantifiable measure of a specific aspect of a service’s performance or reliability. Common SLIs include:
- **Latency:** The time it takes for a system to respond to a request.
- **Availability:** The percentage of time a service is operational and accessible.
- **Error Rate:** The percentage of failed requests out of total requests.

For example, an SLI for a web application might be: "99th percentile latency for HTTP responses over the last 5 minutes."

### What Are SLOs?
A Service Level Objective (SLO) is a target or threshold for an SLI. It defines what level of performance is acceptable for a service. For example:
- "99.9% of HTTP requests should return a response within 500ms over a rolling 30-day window."
SLOs are typically expressed as percentages and are tied to a specific time window.

### Why Do SLOs and SLIs Matter?
SLOs and SLIs provide a shared language for engineering teams, product managers, and stakeholders to discuss reliability. They help:
1. **Set Priorities:** Teams can decide when to focus on reliability versus feature development.
2. **Manage Expectations:** SLOs align internal teams and external customers on what "good enough" looks like.
3. **Reduce Burnout:** By accepting some level of failure (e.g., 99.9% availability instead of 100%), teams can avoid over-engineering and excessive on-call stress.

### SLOs, SLIs, and SLAs
SLOs are often confused with Service Level Agreements (SLAs), but they serve different purposes:
- **SLIs** measure performance (e.g., "latency is 200ms").
- **SLOs** define acceptable performance (e.g., "latency should be under 300ms 99.9% of the time").
- **SLAs** are contractual agreements with customers based on SLOs (e.g., "refunds if latency exceeds 300ms more than 0.1% of the time").

### Practical Example
Consider a video streaming service:
- **SLI:** The percentage of video playback requests that start within 2 seconds.
- **SLO:** "95% of video playback requests should start within 2 seconds over a 30-day period."
- **Action:** If the SLO is breached, the team might prioritize reducing server-side processing time or improving CDN caching.

### Broader Context
SLOs and SLIs are integral to observability and the broader DevOps/SRE ecosystem. They complement monitoring, alerting, and incident management practices. By focusing on user-centric outcomes, they shift the conversation from "Is the system up?" to "Is the system meeting user needs?"

---

## Links
- **Introduction to Site Reliability Engineering (SRE):** Learn how SLOs and SLIs fit into the SRE framework.
- **Monitoring and Observability Best Practices:** Understand how to implement effective metrics and alerts.
- **Service Level Agreements (SLAs):** Explore the relationship between SLOs and SLAs in customer contracts.
- **Error Budgets:** Learn how error budgets, derived from SLOs, help balance reliability and innovation.

---

## Proof / Confidence
- **Google SRE Handbook:** The SLO/SLI framework is a core principle of Google’s SRE practices, widely adopted in the industry.
- **Industry Benchmarks:** Companies like Netflix, Amazon, and Microsoft use SLOs to manage large-scale distributed systems effectively.
- **Common Practice:** SLOs and SLIs are standard tools in observability platforms like Datadog, New Relic, and Prometheus, demonstrating their practical value.
