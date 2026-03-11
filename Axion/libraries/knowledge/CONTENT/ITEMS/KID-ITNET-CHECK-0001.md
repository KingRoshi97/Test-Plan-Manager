---
kid: "KID-ITNET-CHECK-0001"
title: "Service Exposure Checklist (ports, ingress, egress)"
content_type: "checklist"
primary_domain: "networking"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "networking"
  - "checklist"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/networking/checklists/KID-ITNET-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Service Exposure Checklist (ports, ingress, egress)

```markdown
# Service Exposure Checklist (Ports, Ingress, Egress)

## Summary
This checklist provides actionable steps to assess and secure service exposure in networked environments. It focuses on managing ports, ingress, and egress traffic to ensure minimal attack surface and compliance with security best practices. Use this checklist to validate configurations during deployment, audits, or troubleshooting.

## When to Use
- When deploying new services or applications in production or staging environments.
- During periodic security audits of network configurations.
- When troubleshooting unexpected network behavior or suspected unauthorized access.
- Before exposing services to external networks or third-party integrations.

## Do / Don't

### Do:
1. **Do** restrict open ports to only those required for the service to function.
2. **Do** implement ingress and egress filtering to control traffic flow based on least privilege principles.
3. **Do** document all exposed ports, ingress, and egress rules for auditing and troubleshooting purposes.

### Don’t:
1. **Don’t** leave default ports open unless explicitly required and secured.
2. **Don’t** allow unrestricted outbound traffic without justification and monitoring.
3. **Don’t** expose internal services to external networks without proper authentication and encryption.

## Core Content

### 1. Port Management
- **Identify Required Ports:** List all ports required for the service to function. Verify these against the service documentation.
- **Close Unnecessary Ports:** Use a firewall or security group to block all ports except those explicitly needed.
- **Change Default Ports:** Where possible, change default ports to reduce the risk of automated attacks (e.g., SSH from 22 to a non-standard port).

**Rationale:** Open ports are a common attack vector. Minimizing exposed ports reduces the attack surface and mitigates risks such as port scanning and unauthorized access.

---

### 2. Ingress Traffic Control
- **Define Ingress Rules:** Use security groups, firewalls, or ingress policies to allow only necessary traffic to the service.
- **Restrict Source IPs:** Limit access to trusted IP ranges or CIDR blocks. For public-facing services, consider implementing rate limiting.
- **Enable Logging:** Configure logging for ingress traffic to monitor and audit access patterns.

**Rationale:** Controlling ingress traffic prevents unauthorized access and helps detect anomalies or potential attacks.

---

### 3. Egress Traffic Control
- **Whitelist Destinations:** Allow outbound traffic only to known, trusted destinations. Use domain-based filtering where possible.
- **Monitor Outbound Traffic:** Enable logging for outbound traffic to detect unusual patterns or data exfiltration attempts.
- **Block Unnecessary Protocols:** Restrict egress traffic to required protocols (e.g., HTTP, HTTPS, DNS) and block others by default.

**Rationale:** Unrestricted egress traffic can lead to data leaks or command-and-control communication in case of a breach. Monitoring and whitelisting mitigate these risks.

---

### 4. Authentication and Encryption
- **Implement Authentication:** Require strong authentication (e.g., OAuth, API keys, certificates) for all exposed services.
- **Use Encryption:** Enforce TLS for all external-facing services and internal communications where sensitive data is transmitted.
- **Verify Certificates:** Regularly validate SSL/TLS certificates to prevent expired or misconfigured certificates.

**Rationale:** Authentication and encryption ensure that only authorized users can access the service and that data is protected in transit.

---

### 5. Documentation and Review
- **Maintain Documentation:** Keep an updated record of all exposed ports, ingress, and egress rules, including justifications.
- **Conduct Regular Audits:** Periodically review open ports, firewall rules, and traffic logs to identify and remediate misconfigurations.
- **Automate Validation:** Use tools like port scanners, vulnerability scanners, and configuration management systems to validate compliance.

**Rationale:** Documentation and regular reviews ensure consistent security practices and provide a reference for troubleshooting and audits.

## Links
- **Firewall Configuration Best Practices:** Guidance on setting up and managing firewalls effectively.
- **OWASP Secure Configuration Guidelines:** Best practices for securely configuring services and infrastructure.
- **Zero Trust Networking Principles:** Framework for implementing least privilege and micro-segmentation.
- **TLS Deployment Best Practices:** Recommendations for deploying secure TLS configurations.

## Proof / Confidence
This checklist aligns with industry standards such as the **CIS Controls** (Control 9: Limitation and Control of Network Ports) and **NIST SP 800-41** (Guidelines on Firewalls and Firewall Policy). It incorporates widely accepted best practices from OWASP and vendor-specific documentation (e.g., AWS Security Groups, Azure NSGs). Regular application of these practices has been shown to reduce security incidents related to service exposure.
```
