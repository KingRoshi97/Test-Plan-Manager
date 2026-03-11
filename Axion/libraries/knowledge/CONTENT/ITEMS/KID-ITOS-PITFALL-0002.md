---
kid: "KID-ITOS-PITFALL-0002"
title: "Works on my machine Environment Drift"
content_type: "reference"
primary_domain: "operating_systems"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "operating_systems"
  - "pitfall"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/operating_systems/pitfalls/KID-ITOS-PITFALL-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Works on my machine Environment Drift

# Works on My Machine Environment Drift

## Summary

"Works on my machine" environment drift occurs when software behaves as expected in a developer's local environment but fails in other environments, such as staging, production, or another developer's machine. This pitfall is often caused by discrepancies in system configurations, dependencies, or runtime environments. It undermines collaboration, disrupts deployment pipelines, and wastes valuable time debugging issues that could have been avoided.

---

## When to Use

This topic applies to the following scenarios:
- **Cross-environment development:** When code is being developed locally but must run in shared environments like CI/CD pipelines, staging, or production.
- **Team collaboration:** When multiple developers work on the same project but encounter inconsistent behavior due to differences in local setups.
- **Environment-sensitive dependencies:** When software relies on specific versions of libraries, tools, or operating system features.
- **Infrastructure as Code (IaC):** When environments are expected to be reproducible but drift occurs due to misconfigurations or manual changes.

---

## Do / Don't

### Do:
1. **Use containerization tools** like Docker to standardize runtime environments across development, testing, and production.
2. **Define dependencies explicitly** in package managers (e.g., `requirements.txt` for Python, `package.json` for Node.js) and use lock files to pin versions.
3. **Automate environment setup** using tools like Ansible, Terraform, or shell scripts to ensure consistency across machines.
4. **Test in environments that mimic production** (e.g., staging environments with similar configurations).
5. **Document environment requirements** clearly, including OS versions, system dependencies, and configuration settings.

### Don’t:
1. **Rely on manual setup steps** that are prone to human error and inconsistencies.
2. **Assume all developers have identical local environments,** especially in terms of operating systems, libraries, or hardware.
3. **Ignore dependency versioning,** as mismatched versions can lead to subtle and hard-to-diagnose bugs.
4. **Skip testing in staging or CI/CD pipelines** before deploying to production.
5. **Modify environments manually** without documenting or automating the changes.

---

## Core Content

Environment drift occurs when inconsistencies arise between different environments (e.g., local, staging, production) due to differences in configurations, dependencies, or runtime settings. This drift often leads to the infamous "works on my machine" problem, where code functions correctly in one environment but fails in another. Developers unintentionally create drift by relying on implicit assumptions about their local setup, such as specific library versions, system paths, or OS-level features.

### Why People Make This Mistake
1. **Lack of standardization:** Developers may use different operating systems, package versions, or configurations without realizing the impact.
2. **Manual setup:** Environments are set up manually, leading to inconsistencies and undocumented changes.
3. **Neglecting reproducibility:** Developers may prioritize speed over reproducibility, skipping steps like containerization or dependency pinning.

### Consequences
- **Debugging overhead:** Teams waste time diagnosing issues that only occur in specific environments.
- **Deployment failures:** Software may fail in production due to untested differences in the environment.
- **Erosion of trust:** Team members lose confidence in the reliability of the codebase or deployment pipeline.
- **Technical debt:** Environment drift often leads to brittle systems that are difficult to maintain.

### How to Detect It
1. **Inconsistent behavior:** Code that works locally but fails in CI/CD pipelines or on other machines.
2. **Dependency mismatches:** Errors related to missing or incompatible libraries, tools, or system features.
3. **Environment-specific bugs:** Issues that only occur on certain operating systems or configurations.
4. **Frequent "hotfixes":** Repeatedly fixing issues in production that were missed during development or testing.

### How to Fix or Avoid It
1. **Adopt containerization:** Use tools like Docker to encapsulate the runtime environment, ensuring consistency across all stages of development and deployment.
2. **Define and lock dependencies:** Use package managers and lock files to explicitly define and pin dependency versions.
3. **Automate environment setup:** Use scripts or configuration management tools to automate the creation of development, staging, and production environments.
4. **Implement CI/CD pipelines:** Automate testing and deployment processes to catch environment-specific issues early.
5. **Use version control for configurations:** Store environment configurations (e.g., `.env` files, Dockerfiles) in version control to track changes and ensure reproducibility.
6. **Test in production-like environments:** Regularly test code in environments that closely mimic production to catch drift-related issues early.

### Real-World Scenario
A development team is building a Python web application. On one developer's machine, the app runs smoothly, but when deployed to staging, it crashes due to a missing library. Investigation reveals that the developer had installed the library globally on their machine but did not include it in the `requirements.txt` file. To fix the issue, the team updates the `requirements.txt`, pins the library version, and adopts Docker to standardize the runtime environment across all stages of development and deployment. This prevents similar issues in the future.

---

## Links
- **Dependency Management Best Practices:** Learn how to manage dependencies effectively in software projects.
- **Introduction to Docker:** A guide to containerizing applications for consistent environments.
- **Infrastructure as Code (IaC):** Best practices for automating and standardizing infrastructure.
- **CI/CD Pipelines:** How to build and maintain robust continuous integration and deployment pipelines.

---

## Proof / Confidence

This content is supported by industry best practices and tools widely adopted in software development. Containerization using Docker is a standard approach for solving environment drift, as endorsed by major organizations like AWS, Google Cloud, and Microsoft Azure. Dependency management tools like `pip`, `npm`, and `yarn` are integral to modern development workflows. The use of CI/CD pipelines is a proven method to catch environment-specific issues early, as demonstrated by DevOps practices outlined in the DORA (DevOps Research and Assessment) reports.
