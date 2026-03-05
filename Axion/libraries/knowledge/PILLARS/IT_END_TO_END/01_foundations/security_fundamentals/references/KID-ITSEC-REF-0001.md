---
kid: "KID-ITSEC-REF-0001"
title: "Security Terminology Reference (canonical definitions + aliases)"
type: "reference"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "reference"
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

# Security Terminology Reference (canonical definitions + aliases)

# Security Terminology Reference (Canonical Definitions + Aliases)

## Summary
This reference document provides canonical definitions and aliases for key security terminology used in software engineering. It is designed to standardize understanding across teams and ensure consistent communication when discussing security concepts, configurations, and practices.

## When to Use
- When onboarding new team members to security-related projects.
- When designing, implementing, or auditing secure systems.
- When documenting security configurations or troubleshooting security issues.
- When aligning terminology across cross-functional teams to avoid ambiguity.

## Do / Don't

### Do:
1. Use standardized terminology when discussing security to avoid miscommunication (e.g., "Authentication" vs. "Login").
2. Document aliases and definitions in project-specific glossaries for clarity.
3. Regularly update security-related documentation to align with evolving standards.

### Don't:
1. Use ambiguous or colloquial terms when discussing security concepts (e.g., "hacking" instead of "unauthorized access").
2. Overlook aliases commonly used in the industry, as this can lead to confusion.
3. Assume all team members share the same understanding of security terminology without explicit documentation.

## Core Content

### Canonical Definitions + Aliases

#### Authentication
- **Definition**: The process of verifying the identity of a user, device, or system.
- **Aliases**: Login, Identity Verification.
- **Parameters**: Username, password, multi-factor authentication (MFA) tokens.
- **Configuration Options**: Enforce MFA, password complexity rules, session expiration.

#### Authorization
- **Definition**: The process of determining whether an authenticated entity has permission to access a resource or perform an action.
- **Aliases**: Access Control, Permission Validation.
- **Parameters**: Roles, permissions, policies.
- **Configuration Options**: Role-based access control (RBAC), attribute-based access control (ABAC).

#### Encryption
- **Definition**: The process of converting data into a secure format that can only be accessed with a decryption key.
- **Aliases**: Data Protection, Cryptography.
- **Parameters**: Encryption algorithm (AES, RSA), key size, key rotation frequency.
- **Configuration Options**: Enable encryption at rest, encryption in transit, key management policies.

#### Vulnerability
- **Definition**: A weakness in a system that can be exploited to compromise security.
- **Aliases**: Security Flaw, Exploit Vector.
- **Parameters**: Severity level (CVSS score), affected components, remediation steps.
- **Configuration Options**: Regular vulnerability scans, patch management workflows.

#### Threat
- **Definition**: A potential cause of an unwanted security incident.
- **Aliases**: Risk Source, Attack Vector.
- **Parameters**: Threat actor (e.g., insider, external attacker), threat type (e.g., malware, phishing).
- **Configuration Options**: Implement threat detection systems, maintain incident response plans.

#### Incident
- **Definition**: A security event that compromises the confidentiality, integrity, or availability of a system.
- **Aliases**: Security Breach, Event.
- **Parameters**: Incident type (e.g., data breach, denial of service), impact level, response actions.
- **Configuration Options**: Incident response playbooks, logging and monitoring systems.

### Lookup Table: Common Security Aliases

| Canonical Term   | Alias(es)                  | Notes                           |
|------------------|----------------------------|---------------------------------|
| Authentication   | Login, Identity Verification | Often confused with authorization. |
| Authorization    | Access Control, Permission Validation | Defines "what" a user can do. |
| Encryption       | Data Protection, Cryptography | Includes both symmetric and asymmetric encryption. |
| Vulnerability    | Security Flaw, Exploit Vector | Prioritize based on severity. |
| Threat           | Risk Source, Attack Vector | Can be internal or external. |
| Incident         | Security Breach, Event      | Requires immediate response. |

## Links
- **NIST Cybersecurity Framework**: A widely adopted framework for managing cybersecurity risks.
- **OWASP Top Ten**: A list of the most critical web application security risks.
- **ISO/IEC 27001**: International standard for information security management systems.
- **CVE Database**: A repository of publicly disclosed cybersecurity vulnerabilities.

## Proof / Confidence
This content is based on industry standards such as NIST, OWASP, and ISO/IEC 27001, which are recognized globally for defining security best practices. The terminology aligns with common usage in security documentation, training materials, and technical specifications.
