---
kid: "KID-ITCICD-PITFALL-0001"
title: "Unpinned dependencies in CI"
type: pitfall
pillar: IT_END_TO_END
domains:
  - software_delivery
  - ci_cd_devops
subdomains: []
tags: [cicd, dependencies, pinning]
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

# Unpinned dependencies in CI

# Unpinned Dependencies in CI

## Summary
Unpinned dependencies in Continuous Integration (CI) pipelines occur when software projects rely on external libraries or tools without specifying exact versions. This can lead to unpredictable builds, breaking changes, and difficult debugging. Ensuring dependency versions are explicitly pinned is critical for maintaining consistent, reliable, and reproducible CI pipelines.

---

## When to Use
This guidance applies in the following scenarios:
- **CI/CD Pipelines**: When running automated builds, tests, and deployments in CI systems like Jenkins, GitHub Actions, GitLab CI, or CircleCI.
- **Dependency Management**: When your project relies on external libraries, frameworks, or tools (e.g., Python `pip`, JavaScript `npm`, or Java `Maven` dependencies).
- **Infrastructure as Code (IaC)**: When provisioning infrastructure using tools like Terraform, Ansible, or CloudFormation.
- **Containerized Environments**: When building Docker images or deploying Kubernetes workloads that depend on external packages.

---

## Do / Don't

### Do:
1. **Pin Dependency Versions**: Explicitly specify exact versions for all dependencies in your `requirements.txt`, `package.json`, `pom.xml`, or equivalent files.
2. **Use Lockfiles**: Use lockfiles (e.g., `package-lock.json`, `yarn.lock`, `Pipfile.lock`) to ensure consistent dependency resolution across environments.
3. **Automate Dependency Updates**: Use tools like Dependabot, Renovate, or Poetry to automate version updates and review them in a controlled manner.

### Don't:
1. **Use Floating Versions**: Avoid version specifiers like `^`, `~`, or `latest` that allow automatic upgrades without review.
2. **Ignore Transitive Dependencies**: Do not assume that transitive dependencies (dependencies of your dependencies) are stable; they can introduce breaking changes.
3. **Skip Dependency Audits**: Never overlook dependency health checks, such as verifying compatibility, security vulnerabilities, or deprecations.

---

## Core Content

Unpinned dependencies in CI pipelines are a common but critical pitfall in software delivery. They occur when developers fail to specify exact versions for external libraries, frameworks, or tools. Instead, they rely on floating versions (e.g., `^1.2.0`, `~2.3.0`, or `latest`) or omit versioning altogether. While this approach may seem convenient for staying up-to-date, it introduces significant risks.

### Why People Make This Mistake
1. **Convenience**: Developers may assume that the latest version of a dependency will always work.
2. **Lack of Awareness**: Teams may not understand the importance of version pinning or the potential for breaking changes in dependencies.
3. **Time Pressure**: In fast-paced environments, pinning versions may be deprioritized in favor of quick delivery.

### Consequences of Unpinned Dependencies
1. **Build Instability**: A previously working build may fail if a dependency introduces breaking changes in a new release.
2. **Hard-to-Debug Failures**: Debugging issues caused by dependency updates can be time-consuming, especially when the root cause is unclear.
3. **Security Risks**: Unpinned dependencies can inadvertently introduce vulnerabilities if new versions contain security flaws.
4. **Environment Drift**: Different developers or CI agents may resolve dependencies to different versions, leading to inconsistent results.

### How to Detect Unpinned Dependencies
1. **Static Analysis**: Use tools like `pip check`, `npm audit`, or `mvn dependency:tree` to identify unpinned or floating dependencies.
2. **CI Pipeline Audits**: Review your CI configuration files (e.g., `.yml`, `Dockerfile`) for unpinned tools or libraries.
3. **Dependency Lockfiles**: Check for missing or outdated lockfiles in your repository.

### How to Fix or Avoid This Pitfall
1. **Pin Versions**: Explicitly define dependency versions in your configuration files. For example:
   - Python: Use `==` in `requirements.txt` (e.g., `Django==4.2.3`).
   - JavaScript: Use exact versions in `package.json` (e.g., `"lodash": "4.17.21"`).
2. **Use Lockfiles**: Commit lockfiles (e.g., `Pipfile.lock`, `package-lock.json`) to your repository to ensure consistent dependency resolution.
3. **Implement Dependency Management Tools**: Automate dependency updates with tools like Dependabot or Renovate to stay current without risking instability.
4. **Test in Isolation**: Test dependency updates in isolated environments before integrating them into your CI pipeline.
5. **Monitor Dependency Health**: Regularly audit dependencies for compatibility, security vulnerabilities, and deprecations.

### Real-World Scenario
A team building a Python web application encountered sporadic CI failures. The issue was traced to an unpinned library (`requests`) in their `requirements.txt`. A minor update to the library introduced a breaking change, causing their tests to fail. By pinning the version of `requests` and committing a `Pipfile.lock` to their repository, they stabilized their CI pipeline. They also implemented Dependabot to automate version updates, ensuring future upgrades were reviewed and tested before integration.

---

## Links
- **Semantic Versioning Best Practices**: Learn how versioning schemes like SemVer can help manage dependencies effectively.
- **Dependency Management Tools**: Explore tools like Dependabot, Renovate, and Poetry for automating and auditing dependencies.
- **Reproducible Builds**: Understand the importance of reproducible builds in CI/CD pipelines.
- **OWASP Dependency-Check**: A tool for identifying known vulnerabilities in project dependencies.

---

## Proof / Confidence
This guidance is based on industry best practices and widely adopted standards:
- **Semantic Versioning (SemVer)**: A widely used versioning standard that emphasizes compatibility and stability.
- **12-Factor App Methodology**: Recommends explicit dependency declaration for predictable builds.
- **Case Studies**: Numerous real-world incidents, such as the left-pad npm incident, demonstrate the risks of unpinned dependencies.
- **Tooling Support**: Modern CI/CD tools like GitHub Actions and Jenkins emphasize version pinning and reproducibility as foundational principles.
