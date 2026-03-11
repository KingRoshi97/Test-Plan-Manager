---
kid: "KID-ITSEC-CHECK-0007"
title: "External Agent Execution Checklist (least privilege + no copy rules)"
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
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/checklists/KID-ITSEC-CHECK-0007.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# External Agent Execution Checklist (least privilege + no copy rules)

```markdown
# External Agent Execution Checklist (Least Privilege + No Copy Rules)

## Summary
This checklist ensures secure execution of external agents in software systems by adhering to the principles of least privilege and no-copy rules. By following these steps, organizations can minimize security risks, prevent data leakage, and maintain compliance with security best practices.

## When to Use
- When integrating third-party agents, scripts, or executables into your system.
- During the deployment of automation tools or external plugins with access to sensitive data.
- When reviewing or updating permissions for external agents in production or staging environments.
- As part of a security audit or compliance review.

## Do / Don't
### Do:
1. **Do enforce least privilege**: Grant external agents only the minimum permissions required for their function.
2. **Do validate inputs and outputs**: Ensure all data exchanged between external agents and your system is sanitized and verified.
3. **Do log all agent activities**: Maintain detailed logs of external agent executions for auditing and anomaly detection.
4. **Do review permissions periodically**: Regularly audit and update permissions to align with current operational needs.
5. **Do use secure communication channels**: Ensure external agents communicate over encrypted protocols (e.g., HTTPS, SSH).

### Don't:
1. **Don't use default credentials**: Replace default credentials with strong, unique passwords or API keys.
2. **Don't allow unrestricted file access**: Restrict file system access to only the directories required for the agent's operation.
3. **Don't hardcode sensitive data**: Avoid embedding secrets, credentials, or API keys in agent code or configuration files.
4. **Don't skip code reviews**: Ensure all external agent code is reviewed for vulnerabilities before deployment.
5. **Don't ignore dependency risks**: Validate and monitor third-party libraries or dependencies used by the external agent.

## Core Content
### 1. **Permission Management**
   - **Grant specific permissions only**: Assign granular permissions to external agents, such as read-only access to specific files or databases.
     - **Rationale**: Broad permissions increase the attack surface and potential for data breaches.
   - **Use role-based access control (RBAC)**: Group permissions into roles and assign roles to agents rather than individual permissions.
     - **Rationale**: Simplifies permission management and reduces human error.

### 2. **Data Handling**
   - **Enforce no-copy rules**: Prevent external agents from copying or exporting sensitive data unless explicitly required.
     - **Rationale**: Reduces the risk of data exfiltration or accidental exposure.
   - **Implement data masking**: Mask sensitive data fields before exposing them to external agents.
     - **Rationale**: Protects sensitive information while maintaining functionality.

### 3. **Execution Environment**
   - **Isolate execution**: Run external agents in a sandboxed or containerized environment.
     - **Rationale**: Limits the impact of potential vulnerabilities or malicious behavior.
   - **Use ephemeral environments**: Create temporary environments for agent execution and destroy them after use.
     - **Rationale**: Prevents lingering vulnerabilities or unauthorized access.

### 4. **Monitoring and Auditing**
   - **Enable activity logging**: Record all interactions and actions performed by external agents, including timestamps and resource access.
     - **Rationale**: Provides an audit trail for forensic analysis and compliance.
   - **Set up anomaly detection**: Monitor agent behavior for deviations from expected patterns.
     - **Rationale**: Detects potential security incidents in real time.

### 5. **Secure Communication**
   - **Enforce encrypted protocols**: Use TLS/SSL for all communication between external agents and your system.
     - **Rationale**: Protects data in transit from interception or tampering.
   - **Authenticate agents**: Require mutual authentication (e.g., certificates) to verify the identity of external agents.
     - **Rationale**: Prevents unauthorized agents from interacting with your system.

## Links
- **Principle of Least Privilege (NIST)**: Guidelines on granting minimal access for security.
- **OWASP Secure Coding Practices**: Best practices for secure coding and external agent handling.
- **NIST Cybersecurity Framework**: Comprehensive security framework for managing risks.
- **CIS Controls v8**: Security controls for application and system hardening.

## Proof / Confidence
This checklist is based on widely accepted security principles, including the **Principle of Least Privilege** and **Zero Trust Architecture**. It aligns with industry standards such as **NIST SP 800-53** and **ISO/IEC 27001**, which emphasize access control, data protection, and secure system design. Adopting these practices has been shown to reduce security incidents and improve compliance with regulatory requirements.
```
