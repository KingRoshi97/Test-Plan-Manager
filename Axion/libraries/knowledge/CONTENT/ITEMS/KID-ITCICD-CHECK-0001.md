---
kid: "KID-ITCICD-CHECK-0001"
title: "CI Baseline Checklist (lint/test/build)"
content_type: "checklist"
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
  - "c"
  - "i"
  - ","
  - " "
  - "b"
  - "a"
  - "s"
  - "e"
  - "l"
  - "i"
  - "n"
  - "e"
  - ","
  - " "
  - "c"
  - "h"
  - "e"
  - "c"
  - "k"
  - "l"
  - "i"
  - "s"
  - "t"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/ci_cd_devops/checklists/KID-ITCICD-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# CI Baseline Checklist (lint/test/build)

```markdown
# CI Baseline Checklist (lint/test/build)

## Summary
This checklist provides actionable steps to ensure a robust Continuous Integration (CI) pipeline that includes linting, testing, and building processes. It is designed to help software delivery teams establish consistency, detect issues early, and maintain high-quality code throughout the development lifecycle.

## When to Use
Use this checklist when:
- Setting up or revising CI pipelines for software projects.
- Ensuring compliance with organizational or industry CI/CD standards.
- Conducting audits or reviews of existing CI pipelines.
- Integrating new tools or workflows into CI pipelines.

## Do / Don't

### Do:
1. **Do enforce linting rules as part of the pipeline** to ensure consistent code style and catch syntax errors early.
2. **Do run unit tests in isolated environments** to verify functionality without external dependencies.
3. **Do use reproducible build processes** to ensure consistent outputs across environments.
4. **Do fail the pipeline on critical errors** (e.g., linting violations, test failures) to prevent bad code from progressing.
5. **Do use caching mechanisms** to speed up builds and tests where applicable.

### Don't:
1. **Don't skip linting or testing steps** for "minor" changes; even small changes can introduce regressions.
2. **Don't allow flaky tests to persist**; resolve intermittent failures promptly to maintain pipeline reliability.
3. **Don't hardcode environment-specific configurations** in the pipeline; use environment variables or configuration files.
4. **Don't ignore build warnings**; treat them as opportunities to improve code quality.
5. **Don't overload the pipeline with unnecessary steps**; keep it streamlined and focused on critical actions.

## Core Content

### 1. Linting
- **Action:** Integrate a linting tool (e.g., ESLint, Prettier, Pylint) into the pipeline.
  - **Rationale:** Linting ensures consistent code formatting and catches syntax or style errors early.
- **Action:** Configure linting rules to align with team or project standards.
  - **Rationale:** Enforcing consistent rules reduces code churn and improves readability.
- **Action:** Fail the pipeline if linting errors are detected.
  - **Rationale:** Prevents non-compliant code from progressing and reduces technical debt.

### 2. Testing
- **Action:** Run unit tests using a framework (e.g., Jest, PyTest, JUnit) in a clean, isolated environment.
  - **Rationale:** Ensures code functionality without interference from external dependencies.
- **Action:** Include integration tests to validate interactions between components.
  - **Rationale:** Detects issues that unit tests alone may not capture.
- **Action:** Measure code coverage and set thresholds (e.g., 80% coverage).
  - **Rationale:** Encourages thorough testing and highlights untested areas.
- **Action:** Fail the pipeline on any test failure.
  - **Rationale:** Prevents broken code from being deployed.

### 3. Building
- **Action:** Use a build tool (e.g., Maven, Gradle, Webpack) to compile or package the application.
  - **Rationale:** Ensures reproducible builds and prepares the application for deployment.
- **Action:** Validate build artifacts (e.g., checksum verification).
  - **Rationale:** Ensures integrity and consistency of the output.
- **Action:** Optimize build steps (e.g., caching dependencies, parallel builds).
  - **Rationale:** Improves pipeline performance and reduces feedback time.

### 4. General Pipeline Practices
- **Action:** Use version control hooks (e.g., Git pre-commit hooks) to enforce linting and testing locally before pushing changes.
  - **Rationale:** Catches issues early and reduces CI pipeline load.
- **Action:** Implement notifications (e.g., Slack, email) for pipeline failures.
  - **Rationale:** Ensures prompt resolution of issues.
- **Action:** Regularly review and update pipeline configurations.
  - **Rationale:** Keeps the pipeline aligned with evolving project needs and tools.

## Links
- **Continuous Integration Best Practices:** Industry guidelines for designing effective CI pipelines.
- **Code Coverage Standards:** Recommendations for setting and measuring coverage thresholds.
- **Build Optimization Techniques:** Strategies for improving pipeline performance.
- **Linting Tool Documentation:** Official resources for configuring and using popular linting tools.

## Proof / Confidence
This checklist is based on widely accepted CI/CD practices, including:
- **Industry Standards:** Referenced in DevOps frameworks such as DORA and Accelerate.
- **Tool Documentation:** Best practices outlined by popular tools (e.g., Jenkins, CircleCI, GitHub Actions).
- **Case Studies:** Success stories from organizations that implemented strict lint/test/build pipelines and observed improved code quality and reduced deployment failures.
```
