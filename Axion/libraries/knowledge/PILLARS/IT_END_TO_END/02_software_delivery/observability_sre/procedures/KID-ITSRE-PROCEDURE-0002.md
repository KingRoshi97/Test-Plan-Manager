---
kid: "KID-ITSRE-PROCEDURE-0002"
title: "Postmortem Procedure (blameless)"
type: procedure
pillar: IT_END_TO_END
domains:
  - software_delivery
  - observability_sre
subdomains: []
tags: [observability, postmortem, blameless]
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

# Postmortem Procedure (blameless)

```markdown
# Postmortem Procedure (Blameless)

## Summary
A blameless postmortem is a structured process to analyze and learn from incidents in software delivery and observability. It focuses on identifying root causes, improving systems, and preventing recurrence without assigning individual blame. This procedure fosters a culture of continuous improvement and psychological safety.

## When to Use
- After any production incident that caused significant downtime, degraded performance, or customer impact.
- When a near-miss incident occurs that exposes systemic vulnerabilities.
- Following a failed deployment or rollback that caused unexpected side effects.
- After any security breach or compliance violation.

## Do / Don't
### Do:
1. **Do focus on systems and processes, not individuals.** Identify what allowed the issue to occur rather than who caused it.
2. **Do involve all relevant stakeholders.** Include engineers, SREs, product managers, and incident responders.
3. **Do document findings thoroughly.** Ensure the postmortem is accessible for future reference and learning.

### Don't:
1. **Don't assign blame or use accusatory language.** This discourages transparency and learning.
2. **Don't skip the postmortem for minor incidents.** Even small issues can reveal systemic flaws.
3. **Don't rush through the process.** A thorough analysis is critical for meaningful improvements.

## Core Content

### Prerequisites
- Incident has been resolved, and services are stable.
- All relevant logs, metrics, and incident timelines are available.
- A facilitator has been assigned to lead the postmortem discussion.

### Procedure
1. **Schedule the Postmortem Meeting**
   - **Expected Outcome:** All stakeholders are invited, and a clear agenda is shared.
   - **Common Failure Modes:** Missing key participants; unclear meeting objectives.

2. **Gather Incident Data**
   - Collect logs, metrics, and alerts related to the incident.
   - Create a timeline of events, including detection, response, and resolution.
   - **Expected Outcome:** A comprehensive dataset for analysis.
   - **Common Failure Modes:** Missing or incomplete data; lack of access to monitoring tools.

3. **Conduct the Meeting**
   - Begin with a brief summary of the incident.
   - Review the timeline collaboratively, identifying contributing factors and decision points.
   - Focus on "how" and "why" rather than "who."
   - **Expected Outcome:** A shared understanding of the incident's root causes.
   - **Common Failure Modes:** Discussions devolve into blame; lack of facilitator control.

4. **Identify Root Causes**
   - Use techniques like the "5 Whys" or fishbone diagrams to trace issues to their origins.
   - Categorize causes (e.g., technical debt, process gaps, monitoring blind spots).
   - **Expected Outcome:** A clear list of root causes and contributing factors.
   - **Common Failure Modes:** Superficial analysis; failure to identify systemic issues.

5. **Define Action Items**
   - Create specific, actionable tasks to address root causes (e.g., improve monitoring, update runbooks, refactor code).
   - Assign owners and deadlines for each action item.
   - **Expected Outcome:** A prioritized list of improvements with clear accountability.
   - **Common Failure Modes:** Vague or unassigned action items; lack of follow-up.

6. **Document the Postmortem**
   - Write a detailed report covering the incident summary, timeline, root causes, and action items.
   - Store the report in a centralized, searchable repository.
   - **Expected Outcome:** A well-documented postmortem for organizational learning.
   - **Common Failure Modes:** Poorly written or inaccessible documentation.

7. **Follow Up**
   - Track the progress of action items during regular team meetings.
   - Review the effectiveness of implemented changes after a set period.
   - **Expected Outcome:** Continuous improvement and reduced risk of recurrence.
   - **Common Failure Modes:** Action items are forgotten or deprioritized.

## Links
- **Incident Response Best Practices:** Guidance on handling incidents effectively.
- **Root Cause Analysis Techniques:** Tools and methods for identifying root causes.
- **Blameless Postmortem Philosophy:** Insights into fostering a culture of learning.
- **SRE Handbook (Google):** Industry-standard practices for site reliability engineering.

## Proof / Confidence
This procedure aligns with industry standards such as Google's SRE practices and the DevOps Research and Assessment (DORA) reports. Blameless postmortems are widely recognized as a best practice for fostering resilient systems and high-performing teams. Studies show that organizations adopting these practices experience faster incident resolution and fewer recurring issues.
```
