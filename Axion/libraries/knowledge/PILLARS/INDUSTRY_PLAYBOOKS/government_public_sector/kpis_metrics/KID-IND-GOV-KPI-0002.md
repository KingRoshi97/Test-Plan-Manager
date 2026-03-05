---
kid: "KID-IND-GOV-KPI-0002"
title: "Availability Targets for Citizen-Facing Services"
type: "reference"
pillar: "INDUSTRY_PLAYBOOKS"
domains:
  - "government_public_sector"
subdomains: []
tags:
  - "government"
  - "kpi"
  - "availability"
  - "slo"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Availability Targets for Citizen-Facing Services

# Availability Targets for Citizen-Facing Services

## Summary
Citizen-facing services in the public sector must meet high availability targets to ensure uninterrupted access for users. This document outlines key parameters, best practices, and configuration options for defining and maintaining Service Level Objectives (SLOs) aligned with government Key Performance Indicators (KPIs).

---

## When to Use
- When establishing or revising availability targets for public-facing digital services.
- During service design and development to ensure compliance with government KPIs.
- When monitoring, reporting, or troubleshooting service availability issues.
- To align service-level agreements (SLAs) with citizen expectations and regulatory requirements.

---

## Do / Don't

### Do:
1. **Define clear SLOs:** Set measurable availability targets (e.g., 99.9%) based on citizen needs and regulatory standards.
2. **Monitor availability continuously:** Use automated tools to track uptime and downtime in real time.
3. **Plan for redundancy:** Implement failover systems and disaster recovery plans to minimize service disruptions.

### Don't:
1. **Ignore peak usage patterns:** Avoid setting availability targets without analyzing traffic spikes and seasonal demand.
2. **Overpromise availability:** Do not commit to unrealistic targets (e.g., 100%) without robust infrastructure to support them.
3. **Neglect regular audits:** Avoid assuming availability metrics are accurate without periodic validation and testing.

---

## Core Content

### Key Definitions
- **Availability Target:** The percentage of time a service is operational and accessible to users (e.g., 99.9% uptime).
- **Service Level Objective (SLO):** A specific, measurable goal for service performance, including availability.
- **Downtime:** Any period when the service is unavailable or non-functional, impacting users.

### Parameters
| **Metric**           | **Definition**                                   | **Example Target** |
|-----------------------|-------------------------------------------------|---------------------|
| Uptime Percentage     | Percentage of time the service is operational.  | 99.9%              |
| Recovery Time Objective (RTO) | Maximum time to restore service after failure. | ≤ 1 hour           |
| Mean Time Between Failures (MTBF) | Average time between service outages. | ≥ 6 months         |

### Configuration Options
1. **Infrastructure Redundancy:** Deploy load balancers, failover servers, and geographically distributed data centers.
2. **Monitoring Tools:** Use tools like Prometheus, Grafana, or AWS CloudWatch to track availability metrics.
3. **Alerting Systems:** Configure alerts for downtime incidents via email, SMS, or incident management platforms (e.g., PagerDuty).
4. **Scheduled Maintenance Windows:** Define and communicate maintenance periods to minimize user impact.

### Lookup Values for Availability Targets
| **Service Type**               | **Recommended Availability Target** |
|---------------------------------|-------------------------------------|
| Emergency Services Portals      | 99.99%                             |
| Health and Welfare Applications | 99.95%                             |
| Tax Filing Systems              | 99.9%                              |
| Informational Websites          | 99.5%                              |

### Best Practices
- **Citizen-Centric Design:** Prioritize availability for services critical to public welfare.
- **Incident Response:** Establish clear protocols for detecting, reporting, and resolving outages.
- **Capacity Planning:** Regularly evaluate infrastructure to handle projected user growth.

---

## Links
- **Service Level Objectives (SLOs):** Best practices for defining and monitoring SLOs.
- **Disaster Recovery Planning:** Guidelines for creating robust failover and recovery strategies.
- **Government Digital Service Standards:** Frameworks for delivering high-quality digital services.
- **Monitoring and Observability Tools:** Overview of tools for tracking service availability.

---

## Proof / Confidence
This content is supported by industry standards such as ISO 20000 (IT Service Management) and ITIL best practices for service availability. Benchmarks for availability targets are derived from common practices in government and public sector services, including recommendations from the National Institute of Standards and Technology (NIST) and the Government Digital Service (GDS).
