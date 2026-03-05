---
kid: "KID-ITCICD-CONCEPT-0003"
title: "Rollback vs Rollforward"
type: concept
pillar: IT_END_TO_END
domains:
  - software_delivery
  - ci_cd_devops
subdomains: []
tags: [cicd, rollback, rollforward]
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

# Rollback vs Rollforward

# Rollback vs Rollforward

## Summary

Rollback and rollforward are two key strategies for managing changes in software delivery, particularly in the context of Continuous Integration/Continuous Deployment (CI/CD) pipelines. Rollback refers to reverting a system to a previous stable state after a failure, while rollforward involves deploying a new change to fix the issue. Both approaches are critical for maintaining system stability and minimizing downtime in modern DevOps practices.

---

## When to Use

- **Rollback**:
  - When a deployment introduces critical bugs or regressions that cannot be resolved quickly.
  - When the system needs to return to a known stable state to minimize user impact.
  - When debugging or root cause analysis requires a clean, pre-change environment.

- **Rollforward**:
  - When a quick fix or patch can resolve the issue without reverting to a previous version.
  - When the deployment pipeline is designed for rapid iteration and forward progress.
  - When rolling back would introduce additional complexity or risks (e.g., database schema changes).

---

## Do / Don't

### Do:
1. **Do** automate rollbacks and rollforwards in your CI/CD pipelines to reduce human error.
2. **Do** maintain versioned backups of application code, configurations, and databases to enable reliable rollbacks.
3. **Do** ensure thorough testing of rollforward fixes in a staging or pre-production environment before deployment.

### Don't:
1. **Don't** perform a rollback without understanding its implications, especially in systems with stateful dependencies like databases.
2. **Don't** rely solely on rollbacks if your deployment strategy doesn’t support backward compatibility.
3. **Don't** use rollforward as a default strategy without ensuring that the fix has been validated and won’t introduce new issues.

---

## Core Content

Rollback and rollforward are fundamental concepts in software delivery and DevOps, particularly in CI/CD workflows. These strategies are used to manage failures during or after deployments and ensure system reliability.

### Rollback

A rollback involves reverting a system to a previously deployed, stable version. This is typically done when a new deployment introduces critical issues that cannot be fixed immediately. Rollbacks are often used in environments where stability is paramount, such as financial systems or healthcare applications.

For example, if a new version of a web application introduces a bug that causes login failures, a rollback would restore the previous version of the application to ensure users can access the system. Rollbacks are often supported by version control systems (e.g., Git) and deployment tools (e.g., Kubernetes, Terraform, or AWS CodeDeploy).

However, rollbacks can be complex when dealing with stateful components like databases. For instance, if a deployment includes a database schema migration, rolling back the application code without reverting the database schema can lead to inconsistencies. To address this, teams often implement database migration strategies such as backward-compatible schema changes.

### Rollforward

Rollforward, on the other hand, involves deploying a new change to fix the issue introduced by the previous deployment. This approach is common in environments where rapid iteration and forward progress are prioritized, such as agile development teams or startups.

For example, if a deployment introduces a bug that causes a minor UI glitch, a rollforward might involve deploying a hotfix to resolve the issue. Rollforward strategies often rely on robust CI/CD pipelines that enable quick testing and deployment of fixes.

Rollforward is particularly useful in scenarios where rolling back would introduce additional risks or complexity. For instance, if a deployment includes a critical security patch, rolling back might reintroduce the vulnerability, making rollforward the safer option.

### Broader Context

Both rollback and rollforward are part of a broader set of practices in IT end-to-end delivery, ensuring systems remain operational and reliable. These strategies align with key DevOps principles, such as automation, continuous improvement, and minimizing mean time to recovery (MTTR). By integrating rollback and rollforward capabilities into CI/CD pipelines, teams can respond quickly to failures, reduce downtime, and maintain user trust.

---

## Links

- **Blue-Green Deployments**: A deployment strategy that simplifies rollbacks by maintaining two environments (blue and green) and switching traffic between them.
- **Canary Releases**: A technique for deploying changes to a small subset of users before a full rollout, reducing rollback risks.
- **Database Migration Best Practices**: Guidelines for managing schema changes to ensure compatibility with rollback and rollforward strategies.
- **CI/CD Pipeline Design**: Best practices for building robust pipelines that support automated rollback and rollforward.

---

## Proof / Confidence

This content is based on widely adopted industry practices and standards in DevOps and software delivery. Concepts such as rollback and rollforward are integral to frameworks like the **Accelerate State of DevOps Report**, which emphasizes the importance of MTTR and deployment automation. Additionally, tools like Kubernetes, Jenkins, and AWS CodePipeline incorporate native support for these strategies, reflecting their importance in modern CI/CD workflows.
