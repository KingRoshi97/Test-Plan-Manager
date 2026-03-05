---
kid: "KID-ITSRE-PATTERN-0003"
title: "Alerting Hygiene Pattern"
type: pattern
pillar: IT_END_TO_END
domains:
  - software_delivery
  - observability_sre
subdomains: []
tags: [observability, alerting, hygiene]
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

# Alerting Hygiene Pattern

## Summary

The "Alerting Hygiene Pattern" is a structured approach to creating and maintaining actionable, reliable, and meaningful alerts in software delivery and observability systems. It addresses the common challenges of alert fatigue, false positives, and unclear alert definitions, ensuring teams can respond effectively to critical issues while minimizing noise. This pattern promotes a clear, consistent, and scalable alerting strategy aligned with service-level objectives (SLOs).

---

## When to Use

- Your team experiences alert fatigue due to excessive or noisy alerts.
- Alerts frequently result in false positives or are ignored by on-call engineers.
- There is no clear ownership or documentation for existing alerts.
- Alerts are not tied to business-critical outcomes or SLOs.
- You are designing or refactoring an observability and alerting system for a new or existing service.

---

## Do / Don't

### Do:
1. **Define clear alert thresholds** based on SLOs or measurable business impact.
2. **Document every alert** with its purpose, owner, and runbook for resolution.
3. **Regularly review and prune alerts** to remove outdated or redundant ones.
4. **Use severity levels** (e.g., critical, warning) to categorize alerts by impact.
5. **Test alerts in staging environments** to validate accuracy before deploying to production.

### Don't:
1. **Don't alert on symptoms alone** (e.g., CPU spikes) without correlating to user impact.
2. **Don't use generic or vague alert messages** that lack actionable context.
3. **Don't overload on-call engineers** with alerts that are not time-sensitive.
4. **Don't leave alerts unowned**—every alert should have a clear owner for maintenance.
5. **Don't ignore historical alert data** when refining thresholds or removing noise.

---

## Core Content

### Problem
Alerting systems often suffer from poor hygiene, leading to excessive noise, false positives, and unmanageable alert volumes. This can result in alert fatigue, where engineers ignore or dismiss alerts, increasing the risk of missing critical issues. Without a structured approach, teams may struggle to align alerts with business priorities, leading to inefficiencies and degraded service reliability.

### Solution Approach
The Alerting Hygiene Pattern provides a systematic way to create, maintain, and refine alerts to ensure they are actionable, relevant, and aligned with service-level objectives.

#### Step 1: Define Alerting Scope
- Identify the key services or components that require monitoring.
- Map alerts to SLOs or measurable business outcomes (e.g., "95% of requests must complete within 200ms").
- Prioritize alerts that directly impact end-user experience or critical business functions.

#### Step 2: Establish Alert Ownership
- Assign an owner (e.g., a team or individual) for each alert.
- Document the alert's purpose, triggering conditions, and escalation process in a centralized knowledge base.
- Include links to relevant runbooks or playbooks for resolution.

#### Step 3: Categorize and Prioritize Alerts
- Use severity levels (e.g., critical, warning, informational) to classify alerts based on urgency and impact.
- Critical alerts should require immediate action, while warnings may indicate trends to monitor.

#### Step 4: Reduce Noise
- Avoid alerting on transient conditions (e.g., a single CPU spike); use aggregation or smoothing techniques.
- Suppress duplicate alerts or alerts triggered by known maintenance activities.
- Use dynamic thresholds or anomaly detection to reduce false positives.

#### Step 5: Test and Validate Alerts
- Deploy alerts in staging environments to validate their accuracy and relevance.
- Simulate failure scenarios to ensure alerts trigger as expected.
- Review historical alert data to fine-tune thresholds and reduce noise.

#### Step 6: Implement Regular Reviews
- Schedule periodic reviews (e.g., quarterly) to evaluate the effectiveness of alerts.
- Remove or update outdated alerts, and ensure documentation is current.
- Use metrics like Mean Time to Acknowledge (MTTA) and Mean Time to Resolve (MTTR) to assess alert performance.

#### Step 7: Automate Where Possible
- Use automation tools to manage alert lifecycles, such as creating, updating, or retiring alerts.
- Implement automated escalation policies to ensure critical alerts reach the right people.

---

## Links

- **Service-Level Objectives (SLOs):** A foundational concept for aligning alerts with business outcomes.
- **Runbook Best Practices:** Guidance on creating actionable runbooks for alert resolution.
- **Reducing Alert Fatigue:** Strategies for minimizing noise and improving alert relevance.
- **Incident Management Frameworks:** Industry-standard practices for handling on-call and incident response.

---

## Proof / Confidence

This pattern is supported by industry standards such as Google's Site Reliability Engineering (SRE) practices, which emphasize actionable alerts tied to SLOs. Studies on alert fatigue highlight the importance of reducing noise and maintaining clear alert ownership. Common practices in observability tools like Prometheus, Datadog, and PagerDuty align with these principles, demonstrating their effectiveness in real-world scenarios.
