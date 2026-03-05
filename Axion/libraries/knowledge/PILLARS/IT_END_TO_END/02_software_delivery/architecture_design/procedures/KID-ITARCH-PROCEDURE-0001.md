---
kid: "KID-ITARCH-PROCEDURE-0001"
title: "Architecture Review Procedure (what to check)"
type: procedure
pillar: IT_END_TO_END
domains:
  - software_delivery
  - architecture_design
subdomains: []
tags: [architecture, review, procedure]
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

# Architecture Review Procedure (what to check)

```markdown
## Summary

An architecture review ensures that a software system's design aligns with business goals, technical requirements, and best practices. This procedure provides a detailed, step-by-step guide for conducting an effective architecture review, identifying risks, and ensuring the design is scalable, maintainable, and secure.

## When to Use

- Before the implementation phase of a new software project.
- When introducing significant changes to an existing architecture (e.g., migrating to microservices, adopting cloud infrastructure).
- During periodic reviews to ensure the architecture remains aligned with evolving business or technical requirements.
- When addressing performance, scalability, or security concerns in a system.

## Do / Don't

### Do:
1. **Do involve all relevant stakeholders** (e.g., architects, developers, product managers, and operations teams) to gather diverse perspectives.
2. **Do validate architecture decisions against business requirements** to ensure alignment with organizational goals.
3. **Do document all findings, decisions, and action items** for future reference and accountability.

### Don't:
1. **Don't skip reviewing non-functional requirements** (e.g., scalability, availability, security) as they are critical to system success.
2. **Don't allow the review to devolve into a blame session**; focus on constructive feedback and solutions.
3. **Don't ignore technical debt**; address existing issues that could hinder future scalability or maintainability.

## Core Content

### Prerequisites
- A documented architecture diagram (e.g., logical, physical, or deployment diagrams).
- A list of functional and non-functional requirements.
- Access to key stakeholders, including architects, developers, and business representatives.
- A clear agenda and scope for the review session.

### Procedure

1. **Define the Scope and Objectives**
   - **Expected Outcome**: A clear understanding of what aspects of the architecture will be reviewed (e.g., scalability, security, or maintainability).
   - **Common Failure Modes**: Undefined or overly broad scope, leading to an unfocused review.

2. **Gather and Review Documentation**
   - Collect architecture diagrams, requirement specifications, and any existing design decisions.
   - Validate that the documentation is complete and up-to-date.
   - **Expected Outcome**: All stakeholders have a shared understanding of the current architecture.
   - **Common Failure Modes**: Incomplete or outdated documentation, leading to misaligned discussions.

3. **Analyze Functional Alignment**
   - Evaluate whether the proposed architecture meets the stated functional requirements.
   - Identify any gaps or mismatches.
   - **Expected Outcome**: Confirmation that the architecture supports all critical business functions.
   - **Common Failure Modes**: Overlooking edge cases or non-standard workflows.

4. **Assess Non-Functional Requirements**
   - Review the architecture against non-functional requirements such as performance, scalability, availability, security, and maintainability.
   - Identify potential risks or bottlenecks.
   - **Expected Outcome**: A list of areas where the architecture meets or falls short of non-functional requirements.
   - **Common Failure Modes**: Focusing too much on functional aspects and neglecting non-functional requirements.

5. **Evaluate Technology Choices**
   - Assess whether the selected technologies are appropriate for the problem domain, team expertise, and long-term maintainability.
   - Consider trade-offs in terms of cost, complexity, and vendor lock-in.
   - **Expected Outcome**: Validation of technology choices or recommendations for alternatives.
   - **Common Failure Modes**: Blindly following trends or failing to consider the team's ability to support the chosen technologies.

6. **Identify Risks and Dependencies**
   - Document any architectural risks, including external dependencies, single points of failure, or unproven technologies.
   - Propose mitigation strategies for identified risks.
   - **Expected Outcome**: A risk assessment document with actionable mitigation steps.
   - **Common Failure Modes**: Failing to identify hidden dependencies or underestimating risks.

7. **Document and Communicate Findings**
   - Summarize the review outcomes, including strengths, weaknesses, risks, and action items.
   - Share the findings with all stakeholders and ensure alignment on next steps.
   - **Expected Outcome**: A comprehensive review report that serves as a reference for future decisions.
   - **Common Failure Modes**: Poor documentation or lack of follow-up on action items.

### Post-Review Actions
- Schedule follow-up sessions to address identified issues.
- Update the architecture documentation to reflect approved changes.

## Links

- **Software Architecture Design Patterns**: A reference for common architectural patterns and their use cases.
- **Non-Functional Requirements Checklist**: A guide to ensure all critical non-functional aspects are covered.
- **Risk Management in Software Projects**: Best practices for identifying and mitigating risks in software architecture.
- **Cloud-Native Architecture Guidelines**: Recommendations for designing scalable and resilient cloud-based systems.

## Proof / Confidence

This procedure is based on industry best practices, including guidance from the Software Engineering Institute (SEI) and the TOGAF (The Open Group Architecture Framework) standard. It reflects common practices in large-scale software delivery organizations and has been validated through its widespread adoption in agile and DevOps environments.
```
