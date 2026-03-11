---
kid: "KID-ITSEC-PROCEDURE-0002"
title: "Incident Triage Procedure (containment to recovery)"
content_type: "workflow"
primary_domain: "security_fundamentals"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "security_fundamentals"
  - "procedure"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/procedures/KID-ITSEC-PROCEDURE-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Incident Triage Procedure (containment to recovery)

```markdown
# Incident Triage Procedure (Containment to Recovery)

## Summary
This procedure outlines the step-by-step process for triaging security incidents, from initial containment to recovery. It ensures that threats are mitigated quickly, damage is minimized, and systems are restored to a secure operational state. Following this procedure helps maintain organizational security posture and compliance with industry standards.

## When to Use
- When a security incident is detected, such as unauthorized access, malware infection, or data breach.
- When an alert is triggered by a monitoring tool (e.g., SIEM, IDS/IPS).
- During post-incident verification to ensure containment and recovery steps were properly executed.

## Do / Don't
### Do:
1. **Do prioritize containment** to prevent further spread of the incident.
2. **Do document every action** taken during the triage process for audit and analysis purposes.
3. **Do involve relevant stakeholders** (e.g., security team, IT operations, legal) as early as possible.

### Don't:
1. **Don't delay containment** while waiting for full incident details; act quickly to limit damage.
2. **Don't assume the threat is neutralized** without thorough verification and monitoring.
3. **Don't restore systems to production** without confirming they are secure and free of threats.

## Core Content
### Prerequisites
- Incident response plan is available and accessible.
- Security tools (e.g., SIEM, endpoint detection and response) are operational.
- Incident response team (IRT) is trained and on-call.

### Procedure
#### Step 1: Identify and Assess the Incident
- **Action**: Review alerts, logs, and reports to confirm the incident and assess its severity.
- **Expected Outcome**: Incident is classified (e.g., low, medium, high severity) and initial scope is determined.
- **Common Failure Modes**: Misclassification of severity; incomplete log analysis due to insufficient data.

#### Step 2: Contain the Threat
- **Action**: Isolate affected systems (e.g., disconnect from the network, disable compromised accounts).
- **Expected Outcome**: Threat is prevented from spreading to other systems or users.
- **Common Failure Modes**: Overly broad containment causing unnecessary disruption; failure to isolate all affected systems.

#### Step 3: Eradicate the Threat
- **Action**: Remove malicious files, close exploited vulnerabilities, and patch affected systems.
- **Expected Outcome**: The root cause of the incident is eliminated.
- **Common Failure Modes**: Missing secondary infections or backdoors; incomplete patching.

#### Step 4: Recover Systems
- **Action**: Restore systems from clean backups, re-enable services, and verify functionality.
- **Expected Outcome**: Systems are operational and secure with no residual threats.
- **Common Failure Modes**: Restoring from compromised backups; skipping post-recovery verification.

#### Step 5: Monitor and Validate
- **Action**: Monitor systems for recurring signs of the incident and validate that the threat is neutralized.
- **Expected Outcome**: Assurance that the incident has been fully resolved.
- **Common Failure Modes**: Insufficient monitoring leading to missed signs of re-infection.

#### Step 6: Document and Review
- **Action**: Record all actions taken, lessons learned, and update the incident response plan if necessary.
- **Expected Outcome**: Comprehensive documentation for audits and improved future response.
- **Common Failure Modes**: Incomplete documentation; failure to incorporate lessons learned into future planning.

## Links
- **Incident Response Plan Best Practices**: Guidance on creating and maintaining an effective response plan.
- **NIST Cybersecurity Framework (CSF)**: Industry-standard framework for managing cybersecurity risks.
- **Common Vulnerability Scoring System (CVSS)**: Methodology for assessing the severity of vulnerabilities.
- **Post-Incident Review Checklist**: Steps for conducting a thorough post-incident analysis.

## Proof / Confidence
This procedure aligns with industry best practices outlined in the NIST Cybersecurity Framework (CSF) and ISO/IEC 27001 standards. It is based on established methodologies for incident response, including SANS Institute guidelines and real-world incident handling scenarios. Following this procedure ensures compliance with regulatory requirements and reduces the risk of recurring incidents.
```
