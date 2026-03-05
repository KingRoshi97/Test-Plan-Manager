---
kid: "KID-ITSRE-PROCEDURE-0001"
title: "Incident Triage Procedure (ops view)"
type: procedure
pillar: IT_END_TO_END
domains:
  - software_delivery
  - observability_sre
subdomains: []
tags: [observability, incident, triage]
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

# Incident Triage Procedure (ops view)

# Incident Triage Procedure (Ops View)

## Summary
This procedure outlines the steps for triaging incidents in a production environment from an operational perspective. It is designed to help software delivery and observability SRE teams quickly assess, prioritize, and act on incidents to minimize downtime and ensure system reliability.

## When to Use
- When an alert is triggered by monitoring or observability tools indicating potential system degradation or failure.
- During an active incident where the root cause is unknown.
- When performing post-incident reviews to validate triage processes and improve future response.

## Do / Don't

### Do:
1. **Follow the escalation matrix**: Immediately escalate incidents based on severity and impact thresholds.
2. **Document every action**: Log steps taken during triage to ensure traceability and aid post-incident analysis.
3. **Verify monitoring data**: Cross-check alerts with real-time metrics and logs to confirm validity.

### Don't:
1. **Ignore low-priority alerts**: Even seemingly minor issues can escalate; investigate all alerts within SLA timelines.
2. **Make assumptions**: Avoid jumping to conclusions about root causes without sufficient evidence.
3. **Delay communication**: Always inform stakeholders promptly about incident status and expected resolution timelines.

## Core Content

### Prerequisites
- Access to monitoring tools (e.g., Prometheus, Grafana, Datadog).
- Permissions to view logs and system metrics.
- Knowledge of the system architecture and dependencies.
- Incident severity matrix and escalation procedures readily available.

### Procedure

#### Step 1: Acknowledge the Incident
- **Action**: Confirm receipt of the alert in the incident management tool (e.g., PagerDuty, Opsgenie).
- **Expected Outcome**: The alert is acknowledged, and the incident is assigned to an on-call engineer.
- **Common Failure Modes**: Alerts not acknowledged promptly, leading to SLA breaches.

#### Step 2: Assess Severity
- **Action**: Use the severity matrix to determine the impact based on system health, user experience, and business metrics.
- **Expected Outcome**: The incident is categorized (e.g., P1, P2, P3) based on its impact.
- **Common Failure Modes**: Misclassification of severity, leading to delayed escalation or overreaction.

#### Step 3: Gather Context
- **Action**: Review monitoring dashboards, logs, and recent deployment history to identify anomalies.
- **Expected Outcome**: A clear understanding of the system state and potential contributing factors.
- **Common Failure Modes**: Missing or incomplete data due to misconfigured monitoring or logging.

#### Step 4: Mitigate Immediate Impact
- **Action**: Apply temporary fixes (e.g., scaling resources, rolling back deployments) to reduce user-facing impact.
- **Expected Outcome**: System stability is restored temporarily while root cause analysis continues.
- **Common Failure Modes**: Misapplied fixes causing further degradation or masking the root cause.

#### Step 5: Escalate if Necessary
- **Action**: Escalate the incident to senior engineers or specialized teams if the issue is beyond the scope of the on-call engineer.
- **Expected Outcome**: The appropriate team is engaged, and resolution efforts are accelerated.
- **Common Failure Modes**: Delayed escalation leading to prolonged downtime.

#### Step 6: Document Actions
- **Action**: Record all triage steps, findings, and mitigation efforts in the incident management tool.
- **Expected Outcome**: A complete incident timeline is available for post-incident review.
- **Common Failure Modes**: Incomplete documentation causing gaps in post-incident analysis.

#### Step 7: Resolve and Close
- **Action**: Confirm resolution, monitor the system for stability, and close the incident ticket.
- **Expected Outcome**: The incident is resolved, and the system operates normally.
- **Common Failure Modes**: Premature closure without validating stability, leading to recurrence.

## Links
- **Incident Management Best Practices**: Comprehensive guidelines for handling IT incidents effectively.
- **Monitoring and Observability Standards**: Industry benchmarks for system monitoring and alerting.
- **Post-Incident Review Framework**: Steps for conducting thorough root cause analysis and improving processes.

## Proof / Confidence
This procedure aligns with industry standards such as ITIL's Incident Management framework and SRE best practices outlined in Google's "Site Reliability Engineering" book. It reflects common practices validated by benchmarks from leading observability tools like Datadog and Prometheus.
