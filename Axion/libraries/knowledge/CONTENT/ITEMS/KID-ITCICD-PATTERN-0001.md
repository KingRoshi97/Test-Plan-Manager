---
kid: "KID-ITCICD-PATTERN-0001"
title: "Trunk-Based Development Pattern"
content_type: "pattern"
primary_domain: "software_delivery"
secondary_domains:
  - "ci_cd_devops"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "c"
  - "i"
  - "c"
  - "d"
  - ","
  - " "
  - "t"
  - "r"
  - "u"
  - "n"
  - "k"
  - "-"
  - "b"
  - "a"
  - "s"
  - "e"
  - "d"
  - ","
  - " "
  - "b"
  - "r"
  - "a"
  - "n"
  - "c"
  - "h"
  - "i"
  - "n"
  - "g"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/ci_cd_devops/patterns/KID-ITCICD-PATTERN-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Trunk-Based Development Pattern

# Trunk-Based Development Pattern

## Summary
Trunk-Based Development (TBD) is a software development practice where all developers commit their changes directly to a single shared branch, typically called "trunk" or "main." This pattern minimizes long-lived feature branches, encourages frequent integration, and supports continuous delivery by reducing merge conflicts and ensuring a stable codebase. It is particularly effective in fast-paced, collaborative environments where rapid feedback and deployment are critical.

## When to Use
- Teams practicing Continuous Integration and Continuous Delivery (CI/CD).
- Projects requiring frequent releases or deployments (e.g., daily or multiple times per day).
- Collaborative environments where multiple developers work on the same codebase.
- Large-scale systems where merge conflicts and integration delays can significantly impact productivity.
- Organizations aiming to adopt DevOps practices and improve software delivery performance.

## Do / Don't

### Do
1. **Do commit frequently**: Encourage developers to commit small, incremental changes to the trunk multiple times per day.
2. **Do implement robust automated testing**: Use automated unit, integration, and end-to-end tests to ensure code quality and prevent regressions.
3. **Do use feature toggles**: Implement feature flags to control the visibility of incomplete or experimental features in production.

### Don't
1. **Don't use long-lived feature branches**: Avoid creating branches that diverge from the trunk for extended periods, as they lead to merge conflicts and integration delays.
2. **Don't skip code reviews**: Ensure all changes are reviewed, even for small commits, to maintain code quality and knowledge sharing.
3. **Don't ignore build failures**: Treat broken builds as a priority and fix them immediately to maintain a stable trunk.

## Core Content
### Problem
Traditional branching models with long-lived feature branches often lead to significant integration challenges. Developers working in isolation may encounter merge conflicts, regressions, and delays when integrating their changes back into the shared codebase. This slows down the delivery pipeline and increases the risk of defects in production.

### Solution
Trunk-Based Development addresses these issues by promoting a single shared branch (trunk) where all developers commit their changes. By integrating frequently, teams reduce the risk of merge conflicts, maintain a stable codebase, and enable faster feedback cycles.

### Implementation Steps
1. **Set up a single shared branch**:
   - Designate a branch (e.g., `main` or `trunk`) as the central point for all development work.
   - Protect the branch with policies such as mandatory code reviews and passing automated tests before merging.

2. **Adopt a CI/CD pipeline**:
   - Implement a robust CI/CD pipeline that automatically builds, tests, and deploys changes from the trunk.
   - Ensure fast feedback by optimizing build and test times.

3. **Commit frequently**:
   - Encourage developers to commit small, incremental changes multiple times per day.
   - Use tools like Git hooks to enforce commit message standards and pre-commit checks.

4. **Use feature toggles**:
   - Introduce feature flags to enable or disable incomplete features in production without branching.
   - Store feature toggle configurations in a centralized system for easy management.

5. **Monitor and enforce quality**:
   - Use static code analysis, linting, and automated testing to catch issues early.
   - Monitor the trunk's health with dashboards showing build status, test results, and deployment metrics.

6. **Train the team**:
   - Educate developers on the principles and practices of TBD.
   - Provide guidelines for writing small, incremental commits and resolving conflicts quickly.

### Tradeoffs
- **Advantages**:
  - Faster integration and feedback cycles.
  - Reduced merge conflicts and integration delays.
  - Improved collaboration and visibility into the codebase.
  - Easier adoption of CI/CD and DevOps practices.

- **Disadvantages**:
  - Requires a cultural shift and discipline from the team to commit frequently and maintain quality.
  - May not be suitable for projects with highly experimental or isolated features.
  - Increased reliance on feature toggles, which can introduce complexity if not managed properly.

### Alternatives
- **Gitflow**: Suitable for projects with infrequent releases or strict release cycles but introduces long-lived branches and potential integration challenges.
- **Release Branching**: Useful for projects with multiple supported versions in production but increases branch management overhead.

## Links
- **Continuous Integration Practices**: Learn how CI complements TBD to improve software delivery.
- **Feature Toggles Best Practices**: Explore strategies for managing feature flags effectively.
- **DevOps and CI/CD Principles**: Understand how TBD fits into the broader DevOps ecosystem.
- **Gitflow Workflow**: Compare TBD with the Gitflow branching model.

## Proof / Confidence
Trunk-Based Development is a proven practice endorsed by industry leaders such as Google, Netflix, and Facebook. It is highlighted in the Accelerate book as a key enabler of high-performing software delivery teams. Studies show that teams practicing TBD achieve faster lead times, lower change failure rates, and higher deployment frequencies. The State of DevOps Report consistently identifies TBD as a hallmark of elite DevOps performers.
