---
kid: "KID-ITSEC-CHECK-0005"
title: "Dependency Hygiene Checklist (lockfiles, updates, license notes)"
content_type: "checklist"
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
  - "checklist"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/checklists/KID-ITSEC-CHECK-0005.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Dependency Hygiene Checklist (lockfiles, updates, license notes)

# Dependency Hygiene Checklist (lockfiles, updates, license notes)

## Summary
Proper dependency hygiene is critical for maintaining secure and reliable software systems. This checklist ensures dependencies are well-managed, up-to-date, and compliant with licensing and security standards. Following these practices helps mitigate risks such as vulnerabilities, license violations, and compatibility issues.

## When to Use
- During development, especially when adding or updating dependencies.
- Before deploying applications or services to production environments.
- During regular maintenance cycles or security audits.
- When onboarding new team members or transitioning projects between teams.

## Do / Don't

### Do:
1. **Use lockfiles** to freeze dependency versions and ensure reproducible builds across environments.
2. **Regularly update dependencies** to incorporate security patches and new features.
3. **Audit licenses** to ensure all dependencies comply with your organization’s legal and compliance policies.
4. **Automate dependency checks** using tools like Dependabot, Renovate, or Snyk.
5. **Monitor for vulnerabilities** using security scanning tools integrated into your CI/CD pipeline.

### Don't:
1. **Don’t bypass lockfiles** by installing dependencies directly without version control.
2. **Don’t ignore updates** for extended periods, as this increases the risk of security vulnerabilities.
3. **Don’t use dependencies with unclear or incompatible licenses** (e.g., dependencies with restrictive or viral licensing terms).
4. **Don’t rely solely on manual checks** for dependency updates or security issues.
5. **Don’t mix package managers** unless absolutely necessary, as this can lead to conflicts and maintenance challenges.

## Core Content

### Lockfiles
- **Action:** Generate and commit lockfiles (`package-lock.json`, `yarn.lock`, etc.) to version control.
  - **Rationale:** Lockfiles ensure consistent dependency versions across environments, preventing "works on my machine" issues.
- **Action:** Validate lockfiles during CI builds to detect unauthorized changes.
  - **Rationale:** Unauthorized edits to lockfiles can introduce vulnerabilities or break builds.

### Dependency Updates
- **Action:** Schedule regular dependency updates (e.g., weekly or bi-weekly).
  - **Rationale:** Frequent updates reduce the risk of outdated libraries with known vulnerabilities.
- **Action:** Prioritize updates for critical security patches flagged by tools like NVD or OWASP.
  - **Rationale:** Critical vulnerabilities can lead to data breaches or system compromise.
- **Action:** Test updates in staging environments before deploying to production.
  - **Rationale:** Ensures compatibility and prevents regressions.

### License Notes
- **Action:** Maintain a record of all dependency licenses in a `LICENSES.md` file or similar format.
  - **Rationale:** Provides visibility into legal obligations and simplifies audits.
- **Action:** Use automated tools (e.g., FOSSA, SPDX) to scan for license compliance.
  - **Rationale:** Manual tracking is error-prone, especially for large projects.
- **Action:** Avoid dependencies with restrictive licenses (e.g., AGPL) unless explicitly approved by legal teams.
  - **Rationale:** Restrictive licenses can impose obligations that conflict with your organization’s policies.

### Automation and Monitoring
- **Action:** Integrate dependency scanning tools (e.g., Dependabot, Renovate) into your CI/CD pipeline.
  - **Rationale:** Automation reduces human error and ensures timely updates.
- **Action:** Monitor vulnerability databases (e.g., CVE database) for alerts on dependencies.
  - **Rationale:** Proactive monitoring helps prevent exploitation of known issues.
- **Action:** Set up alerts for outdated or insecure dependencies in your package manager configuration.
  - **Rationale:** Early detection allows faster mitigation.

## Links
- **OWASP Dependency-Check**: A tool for identifying publicly disclosed vulnerabilities in project dependencies.
- **Software Package Data Exchange (SPDX)**: A standard for documenting software licenses.
- **National Vulnerability Database (NVD)**: A comprehensive database of known security vulnerabilities.
- **Dependency Management Best Practices**: Guidelines for managing dependencies in modern software development.

## Proof / Confidence
- **Industry Standards:** OWASP recommends dependency management as a key component of secure software development (OWASP Top 10: A9 - Using Components with Known Vulnerabilities).
- **Common Practice:** Tools like Dependabot and Renovate are widely adopted in the industry for automated dependency updates.
- **Benchmarks:** Studies show that outdated dependencies are a leading cause of security breaches, emphasizing the importance of regular updates and scans.

