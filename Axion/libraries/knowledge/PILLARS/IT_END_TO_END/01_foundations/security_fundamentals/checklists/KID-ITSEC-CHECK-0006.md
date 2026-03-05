---
kid: "KID-ITSEC-CHECK-0006"
title: "Threat Model Checklist (assets, actors, mitigations)"
type: "checklist"
pillar: "IT_END_TO_END"
domains:
  - "security_fundamentals"
subdomains: []
tags:
  - "security_fundamentals"
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

# Threat Model Checklist (assets, actors, mitigations)

```markdown
# Threat Model Checklist (assets, actors, mitigations)

## Summary
A threat model identifies potential security risks to a system, evaluates their impact, and defines mitigations. This checklist provides actionable steps to ensure comprehensive coverage of assets, actors, and mitigations in your threat modeling process. Use this checklist to systematically identify and address threats in IT systems, applications, or architectures.

## When to Use
- During the design phase of a new software application or system.
- When introducing significant changes to an existing system (e.g., new features, integrations, or infrastructure changes).
- As part of regular security reviews or audits.
- When responding to a known security incident to prevent recurrence.

## Do / Don't
### Do
- **Do** identify all critical assets and their value to the organization.
- **Do** consider both internal and external threat actors.
- **Do** map threats to specific mitigations and validate their effectiveness.
- **Do** document assumptions about the environment and threat landscape.
- **Do** revisit and update the threat model periodically or when changes occur.

### Don't
- **Don't** overlook non-technical assets such as sensitive business processes or intellectual property.
- **Don't** assume mitigations are effective without validation or testing.
- **Don't** focus solely on external attackers; insider threats are equally important.
- **Don't** rely on a single mitigation for high-risk threats (use defense-in-depth).
- **Don't** skip stakeholder input; involve cross-functional teams for a comprehensive model.

## Core Content
### 1. Identify Assets
- **Inventory critical assets**: List all data, systems, and processes that require protection (e.g., customer data, APIs, servers, intellectual property).
- **Classify assets by sensitivity**: Assign confidentiality, integrity, and availability (CIA) ratings to each asset.
  - *Rationale*: Understanding asset value helps prioritize threats and mitigations effectively.

### 2. Identify Threat Actors
- **Enumerate potential actors**: Include external attackers (e.g., hackers, competitors), internal actors (e.g., employees, contractors), and automated threats (e.g., bots, malware).
- **Define actor motivations and capabilities**: Assess why and how each actor might target your assets.
  - *Rationale*: Different actors have different goals and methods, requiring tailored mitigations.

### 3. Identify Threats
- **Use structured frameworks**: Apply models like STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to identify threats systematically.
- **Consider environmental factors**: Include supply chain risks, third-party integrations, and physical security threats.
  - *Rationale*: A structured approach ensures no threat category is overlooked.

### 4. Define Mitigations
- **Map threats to mitigations**: For each identified threat, specify a corresponding mitigation (e.g., encryption for data confidentiality, access controls for privilege management).
- **Validate mitigations**: Use penetration testing, code reviews, or automated tools to verify that mitigations are effective.
- **Apply defense-in-depth**: Combine multiple layers of security to protect critical assets.
  - *Rationale*: Single points of failure can be exploited; layered defenses reduce risk.

### 5. Document and Review
- **Create a threat model document**: Include assets, actors, threats, mitigations, and assumptions. Use diagrams to visualize attack paths and mitigations.
- **Conduct peer reviews**: Share the model with stakeholders for feedback and validation.
- **Schedule regular updates**: Revisit the threat model after major changes or at least annually.
  - *Rationale*: Threat landscapes evolve, and outdated models can leave gaps in security.

## Links
- **OWASP Threat Modeling**: A comprehensive guide to threat modeling principles and practices.
- **NIST SP 800-30**: Risk Management Guide for Information Technology Systems.
- **STRIDE Framework**: A structured model for identifying and categorizing threats.
- **MITRE ATT&CK Framework**: A knowledge base of adversary tactics and techniques.

## Proof / Confidence
This checklist is based on established industry standards, including OWASP and NIST guidelines, as well as best practices from leading security frameworks like STRIDE and MITRE ATT&CK. These methodologies are widely used in the industry to identify, assess, and mitigate security threats effectively.
```
