---
kid: "KID-LANGGIAC-CHECK-0001"
title: "Github Actions Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "github_actions"
subdomains: []
tags:
  - "github_actions"
  - "checklist"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Github Actions Production Readiness Checklist

```markdown
# Github Actions Production Readiness Checklist

## Summary
This checklist ensures that your GitHub Actions workflows are production-ready, reliable, secure, and maintainable. By following these steps, you can minimize risks, improve performance, and align with best practices for CI/CD pipelines.

## When to Use
- Before deploying a new GitHub Actions workflow to production.
- When auditing or refactoring existing workflows for security, performance, or maintainability.
- During incident postmortems to identify and address pipeline weaknesses.

## Do / Don't

### Do:
- **Do** use pinned versions for actions and dependencies to ensure reproducibility.
- **Do** set up secrets securely using GitHub's encrypted secrets management.
- **Do** configure branch protection rules to enforce CI checks on critical branches.

### Don't:
- **Don't** hardcode sensitive information like API keys or credentials in workflows.
- **Don't** use `latest` tags for actions, as they can introduce breaking changes.
- **Don't** run untrusted or unverified code in your workflows without sandboxing.

## Core Content

### Security
1. **Pin Actions to Specific Versions**
   - Use SHA or version tags (e.g., `actions/checkout@v3`) instead of `latest` to prevent breaking changes or malicious updates.
   - Rationale: Pinned versions ensure workflows execute consistently and are not affected by upstream changes.

2. **Secure Secrets Management**
   - Store sensitive data (e.g., API keys, tokens) in GitHub Secrets.
   - Avoid exposing secrets in logs by using the `secrets` context carefully.
   - Rationale: Prevents accidental leakage of sensitive information.

3. **Run Workflows with Least Privilege**
   - Use the `permissions` key in the workflow file to restrict token access (e.g., `read` or `write` permissions).
   - Rationale: Limits the blast radius in case of a compromised workflow.

### Reliability
4. **Enable Required Status Checks**
   - Configure branch protection rules to require successful workflow runs before merging.
   - Rationale: Ensures code changes are properly validated before deployment.

5. **Implement Retry Logic**
   - Use `continue-on-error: false` and configure retries for flaky steps or external service calls.
   - Rationale: Reduces pipeline failures caused by transient issues.

6. **Test Workflows Locally**
   - Use tools like [act](https://github.com/nektos/act) to test workflows locally before pushing changes.
   - Rationale: Speeds up debugging and reduces unnecessary CI runs.

### Performance
7. **Optimize Job and Step Execution**
   - Use job dependencies (`needs`) to parallelize workflows where possible.
   - Minimize redundant steps and use caching for dependencies (e.g., `actions/cache`).
   - Rationale: Reduces workflow execution time and costs.

8. **Use Self-Hosted Runners if Needed**
   - For resource-intensive workflows, consider self-hosted runners with appropriate hardware.
   - Rationale: Improves performance and avoids hitting GitHub-hosted runner limits.

### Maintainability
9. **Document Workflow Purpose and Key Steps**
   - Add comments to explain non-obvious steps or configurations in the workflow file.
   - Use descriptive job and step names.
   - Rationale: Makes workflows easier to understand and maintain.

10. **Monitor Workflow Performance**
    - Use GitHub Actions usage insights or external monitoring tools to track workflow duration and failure rates.
    - Rationale: Identifies bottlenecks and areas for improvement.

## Links
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - Official documentation for GitHub Actions.
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions) - Guidelines for securing workflows.
- [act GitHub Repository](https://github.com/nektos/act) - Tool for testing GitHub Actions locally.
- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) - Details on using caching to improve workflow performance.

## Proof / Confidence
- **GitHub Security Guidelines**: GitHub recommends pinning actions, securing secrets, and using least-privilege permissions to mitigate risks.
- **Industry Standards**: CI/CD best practices emphasize reproducibility, security, and performance optimization.
- **Common Practice**: Leading engineering teams use similar checklists to ensure production readiness and prevent pipeline failures.
```
