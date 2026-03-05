---
kid: "KID-ITCICD-CHECK-0002"
title: "Deploy Readiness Checklist (observability, rollback)"
type: checklist
pillar: IT_END_TO_END
domains:
  - software_delivery
  - ci_cd_devops
subdomains: []
tags: [cicd, deploy, readiness, checklist]
maturity: "reviewed"
use_policy: reusable_with_allowlist
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

# Deploy Readiness Checklist (observability, rollback)

# Deploy Readiness Checklist (Observability, Rollback)

## Summary
This checklist ensures deployment readiness by verifying observability and rollback mechanisms are in place. It helps teams monitor production systems effectively and recover quickly in case of failure, reducing downtime and minimizing risk. Use this checklist to validate critical deployment prerequisites in CI/CD pipelines.

---

## When to Use
- Prior to deploying any software changes to production environments.
- During staging or pre-production testing phases to validate deployment readiness.
- When introducing new observability tools or rollback mechanisms.
- After significant architectural changes to ensure deployment safeguards remain intact.

---

## Do / Don't

### Do:
1. **Do configure monitoring dashboards for key metrics**: Ensure real-time visibility into application performance and system health.
2. **Do implement automated rollback mechanisms**: Use CI/CD tools to revert to the previous stable version if deployment fails.
3. **Do validate alert thresholds and notifications**: Verify that alerts are actionable and timely for critical failures.
4. **Do test rollback procedures in staging**: Conduct dry runs to ensure rollback processes work as expected.
5. **Do document observability and rollback configurations**: Maintain clear documentation for faster troubleshooting during incidents.

### Don't:
1. **Don't deploy without monitoring coverage**: Deploying without observability risks undetected failures and prolonged downtime.
2. **Don't rely solely on manual rollback processes**: Manual rollbacks are error-prone and slow, increasing recovery time.
3. **Don't ignore error logs or metrics during staging tests**: These are critical for identifying issues early.
4. **Don't set overly sensitive alert thresholds**: Excessive alerts can lead to alert fatigue and reduced response efficiency.
5. **Don't assume rollback is unnecessary for minor changes**: Even small changes can introduce significant issues.

---

## Core Content

### Observability Checklist
1. **Define Key Metrics**:
   - Identify critical metrics (e.g., CPU usage, memory consumption, request latency, error rates).
   - Map metrics to business objectives (e.g., SLA compliance, user experience).
   - Rationale: Metrics provide actionable insights into system health and performance.

2. **Configure Monitoring Tools**:
   - Ensure tools like Prometheus, Grafana, or Datadog are integrated with your application.
   - Set up dashboards for real-time visibility into critical metrics.
   - Rationale: Monitoring tools enable proactive issue detection and faster incident resolution.

3. **Set Alert Thresholds**:
   - Define thresholds for critical metrics (e.g., error rate > 5% triggers an alert).
   - Configure alerting tools (e.g., PagerDuty, Slack integrations) for immediate notifications.
   - Rationale: Alerts ensure timely responses to prevent minor issues from escalating.

4. **Validate Logging Mechanisms**:
   - Ensure logs capture sufficient detail (e.g., request IDs, timestamps, error messages).
   - Use log aggregation tools (e.g., ELK stack, Splunk) for centralized analysis.
   - Rationale: Logs are essential for diagnosing issues and understanding system behavior.

### Rollback Checklist
1. **Automate Rollback Procedures**:
   - Configure CI/CD pipelines (e.g., Jenkins, GitHub Actions) to support automated rollbacks.
   - Use version control tags to quickly identify and revert to stable releases.
   - Rationale: Automation reduces human error and accelerates recovery time.

2. **Test Rollback Scenarios**:
   - Simulate deployment failures in staging environments and verify rollback functionality.
   - Document rollback steps and validate team familiarity with the process.
   - Rationale: Testing ensures rollback reliability under real-world conditions.

3. **Implement Feature Flags**:
   - Use feature flag tools (e.g., LaunchDarkly, Flipper) to toggle features on/off without redeployment.
   - Ensure flags are reversible and scoped to individual features.
   - Rationale: Feature flags allow granular control and reduce the need for full rollbacks.

4. **Monitor Post-Rollback Behavior**:
   - Validate system stability and performance after rollback.
   - Investigate root causes of deployment failure using logs and metrics.
   - Rationale: Post-rollback monitoring ensures the system is restored to a stable state.

---

## Links
- **Continuous Delivery Best Practices**: Industry guidelines for reliable software delivery pipelines.
- **Monitoring and Observability Standards**: Best practices for implementing effective observability in production systems.
- **Rollback Strategies for CI/CD**: Techniques for automated and manual rollback processes.
- **Feature Flags in DevOps**: How to use feature flags for safe and controlled deployments.

---

## Proof / Confidence
- **Industry Standards**: Observability and rollback are core principles in DevOps, as outlined in the DORA (DevOps Research and Assessment) metrics.
- **Case Studies**: Companies like Netflix and Google use robust observability and rollback mechanisms to achieve high availability and rapid recovery.
- **Benchmarks**: Automated rollback reduces mean time to recovery (MTTR) by up to 80%, as reported in the Accelerate State of DevOps Report.
