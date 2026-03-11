---
kid: "KID-ITOS-CHECK-0001"
title: "Minimal Server Baseline Checklist"
content_type: "checklist"
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
  - "checklist"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/operating_systems/checklists/KID-ITOS-CHECK-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Minimal Server Baseline Checklist

# Minimal Server Baseline Checklist

## Summary
This checklist outlines the essential steps to establish a secure and reliable minimal server baseline for operating systems. It ensures servers are configured with foundational security, performance, and monitoring settings before deployment into production. Following this checklist reduces vulnerabilities, improves manageability, and aligns with IT_END_TO_END best practices.

## When to Use
- When provisioning new servers for production, staging, or development environments.
- During server hardening processes to meet organizational security policies.
- Before deploying servers to ensure compliance with operating system and infrastructure standards.
- During audits or remediation of existing servers to align them with baseline requirements.

## Do / Don't

### Do
- **Do apply the latest operating system updates and security patches** to mitigate vulnerabilities.
- **Do disable unused services and ports** to reduce the attack surface.
- **Do enforce strong password policies** to prevent unauthorized access.
- **Do implement centralized logging** to ensure visibility into server activity.
- **Do configure a firewall** to restrict incoming and outgoing traffic based on least privilege.

### Don't
- **Don't use default credentials** for any accounts or services.
- **Don't allow unrestricted root or administrator access**; use role-based access control (RBAC).
- **Don't leave unnecessary software or packages installed**; they increase security risks and resource usage.
- **Don't skip testing server configurations**; verify changes in a staging environment before production deployment.
- **Don't disable security features like SELinux or AppArmor unless justified**; they provide critical protection.

## Core Content

### 1. Operating System Updates
- **Action:** Apply the latest security patches and updates for the operating system.
- **Rationale:** Unpatched systems are vulnerable to exploits. Regular updates ensure protection against known vulnerabilities.

### 2. Account and Access Control
- **Action:** Disable default accounts and enforce strong password policies (e.g., minimum length, complexity, expiration).
- **Action:** Configure role-based access control (RBAC) and limit administrative privileges.
- **Rationale:** Default accounts and weak passwords are common entry points for attackers. RBAC ensures only authorized users can perform sensitive operations.

### 3. Network Configuration
- **Action:** Disable unused network services and close unnecessary ports.
- **Action:** Configure a firewall to allow only required traffic (e.g., SSH, HTTP/HTTPS).
- **Action:** Implement fail2ban or similar tools to block repeated login attempts.
- **Rationale:** Reducing the attack surface minimizes exposure to network-based attacks.

### 4. File System and Storage
- **Action:** Set up disk encryption for sensitive data storage.
- **Action:** Configure file permissions to restrict access to critical directories (e.g., `/etc`, `/var/log`).
- **Action:** Implement quotas to prevent disk overuse by individual users or processes.
- **Rationale:** Protecting sensitive data and system files ensures confidentiality and integrity.

### 5. Logging and Monitoring
- **Action:** Enable centralized logging (e.g., syslog or a log aggregation tool like ELK Stack).
- **Action:** Configure alerts for critical events (e.g., failed login attempts, disk usage thresholds).
- **Action:** Test logging configurations to ensure logs are properly collected and accessible.
- **Rationale:** Centralized logging provides visibility into server activity, aiding in troubleshooting and incident response.

### 6. Security Features
- **Action:** Enable SELinux, AppArmor, or equivalent mandatory access control systems.
- **Action:** Install and configure antivirus or endpoint protection software if applicable.
- **Action:** Set up intrusion detection/prevention systems (IDS/IPS) for real-time monitoring.
- **Rationale:** Security features provide additional layers of protection against unauthorized access and malware.

### 7. Resource Optimization
- **Action:** Disable unnecessary services to reduce resource consumption.
- **Action:** Configure swap space and memory limits to prevent system crashes under heavy load.
- **Rationale:** Optimizing resource usage ensures server stability and performance.

### 8. Backup and Recovery
- **Action:** Configure automated backups for critical data and system configurations.
- **Action:** Test recovery procedures regularly to ensure backups are functional.
- **Rationale:** Reliable backups are essential for disaster recovery and data integrity.

## Links
- **CIS Benchmarks for Server Hardening:** Industry-standard guidelines for secure server configurations.
- **NIST Cybersecurity Framework:** Best practices for securing IT infrastructure.
- **OWASP Server Security Guidelines:** Comprehensive recommendations for server security.
- **System Administrator's Guide to Linux Security:** Practical tips for securing Linux-based servers.

## Proof / Confidence
This checklist is based on widely accepted industry standards, including CIS Benchmarks, NIST guidelines, and OWASP recommendations. These sources are used by organizations globally to secure their IT infrastructure. Additionally, the practices outlined here align with common configurations observed in production environments across multiple industries.
