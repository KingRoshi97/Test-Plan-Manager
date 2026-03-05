---
kid: "KID-ITOS-CHECK-0002"
title: "Runtime Config Checklist (no secrets in repo)"
type: "checklist"
pillar: "IT_END_TO_END"
domains:
  - "operating_systems"
subdomains: []
tags:
  - "operating_systems"
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

# Runtime Config Checklist (no secrets in repo)

```markdown
# Runtime Config Checklist (no secrets in repo)

## Summary
This checklist ensures that runtime configurations are securely managed without exposing sensitive information, such as secrets, in source code repositories. Following these steps minimizes security risks, improves compliance with best practices, and simplifies configuration management for operating systems and applications.

## When to Use
- When deploying applications or services to production or staging environments.
- When setting up CI/CD pipelines for automated deployments.
- During code reviews to verify secure handling of runtime configurations.
- When auditing repositories for compliance with security standards.

## Do / Don't
### Do:
- **Do use environment variables for secrets**: Store sensitive information like API keys, database credentials, and tokens in environment variables.
- **Do use secret management tools**: Leverage tools like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault to securely store and retrieve secrets.
- **Do audit repositories regularly**: Use automated tools to scan repositories for accidental inclusion of secrets.
- **Do separate config from code**: Maintain a clear separation between application code and runtime configuration files.
- **Do implement access controls**: Restrict access to configuration files and secret management systems to authorized personnel only.

### Don't:
- **Don’t hard-code secrets in source code**: Avoid embedding sensitive information directly in application code.
- **Don’t commit `.env` files to version control**: Exclude `.env` and other configuration files containing secrets from repositories.
- **Don’t share secrets over insecure channels**: Avoid sharing sensitive information via email, chat, or other unencrypted communication methods.
- **Don’t use default credentials**: Change default passwords and API keys provided by third-party software or services.
- **Don’t ignore rotation policies**: Regularly rotate secrets to reduce the risk of exposure.

## Core Content
### 1. Secure Runtime Configuration Management
- **Use environment variables**: Store runtime configuration values such as database URLs, API keys, and tokens in environment variables.
  - *Rationale*: Environment variables are process-specific and not stored in the source code, reducing the risk of exposure.
- **Adopt a `.env` pattern for local development**: Use `.env` files for local testing and development, but ensure they are excluded from version control via `.gitignore`.
  - *Rationale*: This allows developers to work locally without exposing sensitive information in shared repositories.

### 2. Secret Management Best Practices
- **Use a secrets management tool**: Implement tools like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault to securely store and retrieve secrets.
  - *Rationale*: These tools provide encryption, access control, and audit logging, ensuring secure handling of sensitive information.
- **Encrypt sensitive configuration files**: If configuration files must contain secrets, encrypt them and use a secure key management solution to decrypt at runtime.
  - *Rationale*: Encryption adds a layer of protection in case the file is accidentally exposed.

### 3. Repository Hygiene
- **Scan repositories for secrets**: Use tools like GitGuardian, TruffleHog, or Gitleaks to detect and remediate secrets accidentally committed to repositories.
  - *Rationale*: Automated scanning helps identify and mitigate risks before they lead to security breaches.
- **Remove secrets from Git history**: If secrets are accidentally committed, use tools like `git filter-repo` or `BFG Repo-Cleaner` to remove them from the repository history.
  - *Rationale*: Simply deleting a file or commit does not remove it from the repository’s history.

### 4. Access Control and Monitoring
- **Restrict access to secrets**: Use role-based access control (RBAC) to limit access to secret management systems and configuration files.
  - *Rationale*: Reducing the number of people with access minimizes the attack surface.
- **Monitor access and usage**: Enable logging and monitoring for secret access and usage to detect unauthorized activity.
  - *Rationale*: Monitoring helps identify potential security incidents and ensures compliance with audit requirements.

### 5. Deployment and CI/CD Practices
- **Inject secrets at runtime**: Use CI/CD tools to inject secrets into the runtime environment rather than storing them in configuration files.
  - *Rationale*: This ensures secrets are only available during the execution of the application and not stored persistently.
- **Rotate secrets regularly**: Implement automated rotation policies for secrets to reduce the risk of long-term exposure.
  - *Rationale*: Regular rotation limits the impact of a leaked or compromised secret.

## Links
- **OWASP Application Security Verification Standard (ASVS)**: Guidelines for secure configuration management and secret handling.
- **12-Factor App Methodology**: Best practices for application deployment, including configuration management.
- **GitGuardian Blog**: Practical tips and tools for detecting and managing secrets in repositories.
- **HashiCorp Vault Documentation**: Comprehensive guide to setting up and using Vault for secret management.

## Proof / Confidence
This checklist is based on widely accepted industry standards, including the **OWASP ASVS**, **12-Factor App methodology**, and security practices recommended by secret management tools such as **HashiCorp Vault** and **AWS Secrets Manager**. Tools like GitGuardian and TruffleHog are commonly used in the industry to detect secrets in repositories, and their effectiveness is well-documented. Adopting these practices aligns with security benchmarks and reduces the risk of exposing sensitive information.
```
