---
kid: "KID-ITSEC-PATTERN-0001"
title: "Security Baseline by Default (secure defaults checklist)"
type: "pattern"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
  - "pattern"
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

# Security Baseline by Default (secure defaults checklist)

# Security Baseline by Default (Secure Defaults Checklist)

## Summary
The "Security Baseline by Default" pattern ensures that software systems are configured with secure defaults to minimize vulnerabilities out of the box. By adopting this approach, developers reduce the likelihood of human error, misconfiguration, and exploitation of insecure settings, thereby improving overall system security.

## When to Use
- When designing new systems or applications to enforce secure configurations from the outset.
- When onboarding third-party software or services that require configuration for secure operation.
- During system upgrades or migrations to ensure legacy configurations don’t introduce vulnerabilities.
- In environments where users or administrators may lack deep security expertise, making manual configuration error-prone.

## Do / Don't

### Do:
1. **Do enforce strong password policies by default.** Require minimum password lengths, complexity, and expiration periods.
2. **Do disable unused services and ports.** Reduce the attack surface by turning off unnecessary features or network access points.
3. **Do enable secure communication protocols by default.** Use TLS 1.2 or higher and disable outdated protocols like SSL or TLS 1.0.
4. **Do log security-relevant events by default.** Ensure logging is enabled for authentication attempts, privilege escalations, and configuration changes.
5. **Do provide clear documentation for security settings.** Help users understand the rationale and implications of default configurations.

### Don't:
1. **Don’t allow default credentials.** Avoid shipping systems with default usernames and passwords (e.g., "admin/admin").
2. **Don’t rely on users to enable security features.** Features like encryption, firewalls, and access controls should be enabled by default.
3. **Don’t expose sensitive information in error messages.** Avoid default configurations that reveal stack traces, system paths, or database errors.
4. **Don’t assume users will read all documentation.** Defaults should be secure even if users skip configuration steps.
5. **Don’t leave debugging or development settings enabled in production.** These can expose sensitive information or weaken security.

## Core Content
### Problem
Misconfigurations are a leading cause of security breaches. Systems that ship with insecure defaults, such as open ports, weak passwords, or outdated protocols, are vulnerable to exploitation. Users often lack the expertise or awareness to configure systems securely, leaving critical gaps in protection.

### Solution Approach
Implement secure defaults to minimize the need for manual configuration and reduce the risk of human error. A secure-by-default system ensures that even if users do not modify settings, the system operates in a secure state.

### Implementation Steps
1. **Identify Critical Security Areas**  
   - Authentication: Enforce strong password policies, multi-factor authentication (MFA), and account lockout mechanisms.  
   - Network Access: Disable unused ports and services. Configure firewalls to deny all traffic by default, allowing only explicitly permitted connections.  
   - Data Protection: Enable encryption for data at rest and in transit. Use strong, modern encryption algorithms (e.g., AES-256 for storage, TLS 1.2+ for communication).  

2. **Apply Secure Defaults**  
   - Set secure configurations for all services and components during installation or deployment. For example, databases should require authentication, and web servers should default to HTTPS.  
   - Disable insecure legacy features, such as SMBv1, Telnet, or FTP.  

3. **Automate Security Baselines**  
   - Use configuration management tools (e.g., Ansible, Chef, Puppet) to enforce secure defaults across environments.  
   - Implement Infrastructure as Code (IaC) templates with pre-configured secure settings.  

4. **Provide Overrides for Advanced Users**  
   - Allow experienced users to modify configurations, but ensure changes are logged and auditable.  
   - Include warnings or prompts when users attempt to disable critical security features.  

5. **Test and Validate Defaults**  
   - Conduct security audits and penetration tests to verify that default settings meet industry standards.  
   - Use tools like CIS Benchmarks or OWASP ASVS to validate configurations.  

6. **Educate Users**  
   - Provide clear, concise documentation explaining the default settings and their security implications.  
   - Offer guidance on how to safely modify configurations when necessary.  

### Tradeoffs
- **Ease of Use vs. Security:** Secure defaults may inconvenience some users by requiring additional steps (e.g., MFA setup). Balance usability with security needs.  
- **Backward Compatibility:** Disabling legacy protocols or features may break compatibility with older systems. Evaluate the risk of maintaining insecure features versus the cost of upgrading dependent systems.  
- **Performance Impact:** Some secure defaults (e.g., encryption) may slightly impact performance. Optimize configurations to minimize overhead without sacrificing security.  

### Alternatives
- For highly customizable systems, consider providing a "secure setup wizard" that guides users through configuring security settings, rather than enforcing defaults.  
- In environments with strict regulatory requirements, use compliance frameworks (e.g., NIST, ISO 27001) to define and enforce baseline configurations.  

## Links
- **CIS Benchmarks**: Industry-standard security configuration guidelines for various platforms.  
- **OWASP Secure Configuration**: Best practices for secure software configurations.  
- **NIST SP 800-53**: Security and privacy controls for federal information systems and organizations.  
- **Infrastructure as Code (IaC)**: Automating secure configurations using tools like Terraform or CloudFormation.  

## Proof / Confidence
- **Industry Standards:** CIS Benchmarks and OWASP guidelines emphasize secure defaults as a critical security practice.  
- **Research Studies:** Reports from organizations like Verizon and IBM consistently identify misconfigurations as a leading cause of breaches.  
- **Common Practice:** Leading cloud providers (e.g., AWS, Azure, Google Cloud) enforce secure defaults, such as encrypted storage and secure network configurations, by default.  

