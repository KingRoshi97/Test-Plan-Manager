---
kid: "KID-ITSEC-EXAMPLE-0001"
title: "Example Threat Model (small web app)"
content_type: "reference"
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
  - "example"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/examples/KID-ITSEC-EXAMPLE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Example Threat Model (small web app)

# Example Threat Model (Small Web App)

## Summary

This article provides a worked example of a threat model for a small web application. Using a step-by-step approach, it identifies potential threats, evaluates their impact, and outlines mitigations. The example focuses on common attack vectors such as authentication, data exposure, and server vulnerabilities, emphasizing practical security measures for small-scale applications.

---

## When to Use

- When developing or maintaining a small web application that handles sensitive or user-specific data.
- During the design phase of a web app to proactively identify and address security risks.
- Before deploying a web app to ensure security measures are in place.
- When conducting periodic security reviews or audits of an existing application.

---

## Do / Don't

### Do:
1. **Identify assets and data flows:** Map out what data is stored, transmitted, or processed, and where it resides.
2. **Prioritize threats:** Focus on high-impact and high-probability threats, such as unauthorized access or data breaches.
3. **Use established frameworks:** Apply methodologies such as STRIDE or OWASP Threat Modeling for structured analysis.
4. **Document mitigations:** Clearly define the security measures implemented to address each identified threat.
5. **Review regularly:** Update the threat model as the application evolves or new vulnerabilities are discovered.

### Don't:
1. **Ignore external dependencies:** Failing to account for third-party libraries, APIs, or integrations can leave gaps in your threat model.
2. **Overlook user behavior:** Assume all users will act as intended; account for malicious or negligent actions.
3. **Rely solely on tools:** Automated tools are helpful but cannot replace manual analysis and critical thinking.
4. **Skip validation:** Avoid deploying mitigations without verifying their effectiveness through testing or review.
5. **Underestimate insider threats:** Treat internal actors (developers, admins) as potential sources of risk.

---

## Core Content

### Scenario Overview

Imagine a small web application used by a local business to manage customer appointments. The app includes:
- A login system for customers and administrators.
- A database storing customer details (e.g., names, email addresses, appointment history).
- An admin panel for managing appointments and viewing customer data.

The app is hosted on a cloud provider and uses a third-party library for authentication.

### Step 1: Identify Assets and Data Flows
- **Assets:** Customer data, admin credentials, appointment records, and the app's source code.
- **Data Flows:** User login requests, appointment data updates, and admin panel interactions.
- **External Dependencies:** Authentication library and cloud hosting provider.

### Step 2: Enumerate Threats
Using the STRIDE framework:
- **Spoofing:** Attackers impersonate legitimate users to access sensitive data.
- **Tampering:** Unauthorized modification of appointment records.
- **Repudiation:** Lack of logging makes it impossible to trace malicious actions.
- **Information Disclosure:** Customer data exposed due to insecure storage or transmission.
- **Denial of Service (DoS):** Attackers overwhelm the app, making it unavailable.
- **Elevation of Privilege:** Exploiting vulnerabilities to gain admin-level access.

### Step 3: Assess Risks
Each threat is evaluated based on likelihood and impact:
- **Spoofing:** High likelihood (weak password policies), high impact (data breach).
- **Tampering:** Medium likelihood (limited admin access), high impact (appointment errors).
- **Information Disclosure:** High likelihood (unencrypted database), high impact (privacy violation).

### Step 4: Mitigation Strategies
1. **Spoofing:** Enforce strong password policies, implement multi-factor authentication (MFA), and validate inputs during login.
2. **Tampering:** Restrict admin access via role-based access control (RBAC) and log all changes to appointment records.
3. **Information Disclosure:** Encrypt sensitive data both at rest and in transit using TLS and AES-256.
4. **Denial of Service:** Rate-limit incoming requests and implement cloud-based DoS protection.
5. **Elevation of Privilege:** Regularly patch the authentication library and conduct penetration testing to identify vulnerabilities.

### Step 5: Validate and Document
- Test mitigations to confirm effectiveness (e.g., simulate spoofing attempts).
- Document the threat model, including identified risks, mitigations, and testing results.
- Schedule periodic reviews to ensure ongoing security.

---

## Links

- **OWASP Threat Modeling Cheat Sheet:** A concise guide to threat modeling best practices.
- **STRIDE Framework Overview:** Detailed explanation of the STRIDE methodology for threat identification.
- **OWASP Top 10:** Common vulnerabilities in web applications and mitigation strategies.
- **NIST Cybersecurity Framework:** Guidelines for managing cybersecurity risks.

---

## Proof / Confidence

This approach aligns with industry standards such as OWASP Threat Modeling and NIST Cybersecurity Framework. The STRIDE methodology is widely used for identifying threats, and mitigations like encryption, MFA, and RBAC are considered best practices in web application security. Regular testing and documentation ensure compliance with security benchmarks and reduce the risk of vulnerabilities.
