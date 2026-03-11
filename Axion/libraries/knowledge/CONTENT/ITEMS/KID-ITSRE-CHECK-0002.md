---
kid: "KID-ITSRE-CHECK-0002"
title: "Incident Readiness Checklist"
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
  - "i"
  - "n"
  - "c"
  - "i"
  - "d"
  - "e"
  - "n"
  - "t"
  - ","
  - " "
  - "r"
  - "e"
  - "a"
  - "d"
  - "i"
  - "n"
  - "e"
  - "s"
  - "s"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/observability_sre/checklists/KID-ITSRE-CHECK-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Incident Readiness Checklist

# Incident Readiness Checklist

## Summary
This checklist provides a structured approach to ensure your team is prepared to handle incidents effectively. It covers key areas such as monitoring, communication, documentation, and tooling, enabling your organization to minimize downtime and mitigate risks during critical events.

## When to Use
- Before deploying a new service or feature to production.
- During routine incident readiness reviews (e.g., quarterly or biannually).
- When onboarding new team members to incident response processes.
- After a major incident to validate readiness improvements.

## Do / Don't

### Do:
1. **Do establish clear ownership for incident response roles.** Assign primary and secondary responders for every critical system.
2. **Do configure actionable alerts.** Ensure alerts are meaningful, have clear thresholds, and include runbooks or next steps.
3. **Do conduct regular incident response drills.** Simulate real-world scenarios to test team readiness and identify gaps.
4. **Do document escalation paths.** Ensure everyone knows how to escalate issues to the right stakeholders.
5. **Do validate monitoring coverage.** Ensure all critical systems and dependencies are monitored with appropriate metrics.

### Don’t:
1. **Don’t rely solely on email for critical incident communication.** Use real-time channels like Slack, PagerDuty, or MS Teams for urgent notifications.
2. **Don’t ignore post-incident reviews.** Skipping retrospectives leads to repeated mistakes and missed opportunities for improvement.
3. **Don’t over-alert teams.** Avoid alert fatigue by ensuring every alert is actionable and relevant.
4. **Don’t assume everyone knows the process.** Always provide training and documentation for incident response procedures.
5. **Don’t neglect third-party dependencies.** Ensure external services have SLAs and monitoring in place.

## Core Content

### Monitoring and Observability
- **Verify monitoring coverage:** Ensure all critical systems, APIs, and services have monitoring enabled for key metrics (e.g., latency, error rates, CPU/memory usage).
- **Set up alerting thresholds:** Define thresholds for alerts that reflect real issues (e.g., 95th percentile latency exceeding 500ms).
- **Ensure logs are centralized and searchable:** Use tools like ELK, Splunk, or Datadog to aggregate logs for quick access during incidents.
- **Test alert delivery channels:** Verify that alerts are routed to the correct on-call personnel via tools like PagerDuty or OpsGenie.

### Incident Response Roles and Responsibilities
- **Define incident commander roles:** Assign a dedicated incident commander to lead response efforts and avoid confusion during incidents.
- **Document responder responsibilities:** Clearly outline the roles of engineers, SREs, and other stakeholders during an incident.
- **Maintain an up-to-date on-call schedule:** Ensure on-call rotations are well-documented and accessible to the team.

### Communication and Escalation
- **Set up incident communication channels:** Create dedicated Slack channels or equivalent for incident discussions.
- **Document escalation paths:** Include contact information for key stakeholders, such as senior engineers, product managers, and third-party vendors.
- **Prepare customer communication templates:** Draft pre-approved messages for customer updates during high-severity incidents.

### Tooling and Automation
- **Verify incident management tools:** Ensure tools like PagerDuty, StatusPage, or ServiceNow are configured and tested.
- **Automate common workflows:** Use runbooks and scripts to automate repetitive tasks like restarting services or scaling infrastructure.
- **Test failover mechanisms:** Regularly test backups, failover systems, and disaster recovery plans.

### Training and Drills
- **Conduct tabletop exercises:** Simulate incidents to test team readiness and improve processes.
- **Provide incident response training:** Ensure all team members understand the tools, processes, and expectations during incidents.
- **Review past incidents:** Analyze post-mortems to identify recurring issues and implement preventive measures.

## Links
- **Incident Management Best Practices:** Guidance on structuring incident response processes.
- **Post-Incident Review Framework:** A template for conducting effective retrospectives.
- **Monitoring and Observability Standards:** Industry benchmarks for system monitoring.
- **SRE Handbook on Incident Response:** Detailed practices from Google's SRE guide.

## Proof / Confidence
This checklist aligns with industry standards such as Google's SRE practices, ITIL incident management guidelines, and DevOps monitoring frameworks. Studies show organizations with robust incident readiness reduce mean time to recovery (MTTR) by up to 50%. Regular drills and process reviews are commonly cited as best practices in incident response by leading tech organizations.
