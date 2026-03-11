---
kid: "KID-ITSEC-CONCEPT-0001"
title: "Threat Modeling Basics (assets, actors, attack surfaces)"
content_type: "concept"
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
  - "concept"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/concepts/KID-ITSEC-CONCEPT-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Threat Modeling Basics (assets, actors, attack surfaces)

# Threat Modeling Basics (assets, actors, attack surfaces)

## Summary
Threat modeling is a structured approach to identifying, evaluating, and mitigating potential security threats to a system. It focuses on understanding assets, actors, and attack surfaces to predict and address vulnerabilities before they can be exploited. This process is critical for designing secure systems and reducing risk in software development and IT operations.

## When to Use
- During the design phase of a new software system or application to ensure security is integrated from the start.
- When implementing significant changes to an existing system, such as adding new features, integrating third-party components, or migrating to the cloud.
- As part of regular security assessments or audits to identify new vulnerabilities introduced by evolving threats.
- When handling sensitive data, such as personally identifiable information (PII), financial data, or intellectual property.
- In response to regulatory or compliance requirements, such as GDPR, HIPAA, or PCI-DSS, which mandate risk assessments.

## Do / Don't

### Do:
1. **Identify key assets**: Focus on what needs protection, such as sensitive data, critical infrastructure, or proprietary algorithms.
2. **Map out actors**: Consider all potential users, both legitimate (e.g., admins, users) and malicious (e.g., hackers, insiders).
3. **Continuously update models**: Revisit and revise threat models as systems evolve or new threats emerge.

### Don't:
1. **Ignore external dependencies**: Overlooking third-party integrations or APIs can leave critical attack surfaces unprotected.
2. **Overcomplicate the process**: Use a structured framework like STRIDE or PASTA to keep the process manageable and actionable.
3. **Assume perfect security**: No system is invulnerable; focus on reducing risk rather than achieving unrealistic "perfect" security.

## Core Content
Threat modeling is a proactive security practice that helps organizations anticipate and defend against potential attacks. It revolves around three key elements:

### 1. **Assets**
Assets are the components or data within a system that require protection. Examples include:
- **Data assets**: Customer information, encryption keys, or intellectual property.
- **Infrastructure assets**: Servers, databases, or cloud environments.
- **Application assets**: Source code, APIs, or configuration files.

Understanding assets helps prioritize security efforts. For instance, protecting encryption keys is more critical than securing public-facing documentation.

### 2. **Actors**
Actors are entities that interact with the system, either legitimately or maliciously. These include:
- **Legitimate actors**: End-users, administrators, or third-party services.
- **Malicious actors**: Hackers, insiders, or automated bots.

Identifying actors helps define potential threat vectors. For example, an admin account with excessive privileges could become a target for attackers.

### 3. **Attack Surfaces**
The attack surface is the sum of all points where an attacker could potentially exploit a system. Common attack surfaces include:
- **Network interfaces**: Open ports, exposed APIs, or unpatched protocols.
- **User interfaces**: Login forms, file upload features, or input fields.
- **Third-party integrations**: External APIs, libraries, or cloud services.

Minimizing the attack surface is a key goal of threat modeling. For example, disabling unused ports or enforcing input validation reduces the risk of exploitation.

### Frameworks and Methodologies
Several frameworks guide the threat modeling process:
- **STRIDE**: Focuses on six threat categories: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege.
- **PASTA (Process for Attack Simulation and Threat Analysis)**: A seven-step methodology that aligns security analysis with business objectives.
- **Attack Trees**: Visual representations of attack paths, helping teams understand how threats can materialize.

### Practical Example
Consider a web-based e-commerce platform:
1. **Assets**: Customer payment data, user accounts, and the order database.
2. **Actors**: Customers, administrators, and potential attackers.
3. **Attack Surfaces**: Login forms (susceptible to credential stuffing), payment APIs (vulnerable to man-in-the-middle attacks), and admin dashboards (targets for privilege escalation).

By identifying these elements, the team can implement mitigations such as multi-factor authentication, encryption for payment data, and role-based access controls.

## Links
- **STRIDE Framework**: A widely used methodology for categorizing and analyzing threats.
- **OWASP Top Ten**: A list of the most critical web application security risks.
- **NIST Cybersecurity Framework**: A comprehensive guide for managing cybersecurity risks.
- **Microsoft Threat Modeling Tool**: A free tool for creating and analyzing threat models.

## Proof / Confidence
Threat modeling is a well-established practice endorsed by industry leaders, including OWASP, NIST, and Microsoft. Its effectiveness is supported by case studies demonstrating reduced vulnerabilities and improved security postures in organizations that adopt it. Additionally, frameworks like STRIDE and PASTA provide structured, repeatable processes that align with industry standards.
