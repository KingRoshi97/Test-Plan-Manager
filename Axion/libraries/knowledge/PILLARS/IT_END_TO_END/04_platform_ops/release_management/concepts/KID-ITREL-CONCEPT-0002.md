---
kid: "KID-ITREL-CONCEPT-0002"
title: "Breaking Change vs Non-Breaking Change"
type: concept
pillar: IT_END_TO_END
domains:
  - platform_ops
  - release_management
subdomains: []
tags: [release, breaking-change, compatibility]
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

# Breaking Change vs Non-Breaking Change

# Breaking Change vs Non-Breaking Change

## Summary
A **breaking change** is a modification to a system, API, or platform that disrupts or invalidates existing functionality, requiring consumers to adapt their code or processes. A **non-breaking change**, on the other hand, introduces enhancements or fixes without impacting existing functionality. Understanding and managing these changes is critical in platform operations and release management to ensure system stability and maintain developer trust.

## When to Use
- **Breaking Changes**: Use when fundamental design flaws must be corrected, deprecated functionality needs removal, or a major version upgrade is required.
- **Non-Breaking Changes**: Use for bug fixes, performance improvements, or backward-compatible feature additions that do not disrupt existing consumers.

## Do / Don't
### Do:
1. **Clearly Communicate Breaking Changes**: Notify stakeholders well in advance, providing migration guides and timelines.
2. **Follow Semantic Versioning**: Increment the major version for breaking changes and the minor version for non-breaking changes.
3. **Test Backward Compatibility**: Ensure non-breaking changes do not unintentionally break existing functionality through rigorous testing.

### Don't:
1. **Introduce Breaking Changes Without Warning**: Avoid sudden disruptions that can lead to outages or consumer dissatisfaction.
2. **Overload a Single Release**: Avoid bundling breaking and non-breaking changes in the same release, as it complicates adoption.
3. **Assume Non-Breaking Changes Are Risk-Free**: Even minor changes can have unintended side effects; always validate.

## Core Content
### What is a Breaking Change?
A **breaking change** alters the behavior or structure of a system in a way that existing consumers must adapt to continue functioning. This includes:
- Removing or renaming APIs, endpoints, or methods.
- Changing the structure of data models or schemas.
- Modifying system behavior in a way that violates previous contracts or expectations.

#### Example:
- Removing a REST API endpoint `/getUserDetails` without providing an alternative.
- Changing the data type of a field in a database schema (e.g., `age` from `integer` to `string`).

### What is a Non-Breaking Change?
A **non-breaking change** enhances or fixes the system without disrupting existing consumers. These changes are backward-compatible and do not require immediate consumer action.

#### Example:
- Adding a new optional field to an API response.
- Introducing a new method in an SDK while keeping existing methods intact.
- Fixing a bug in a way that aligns with existing documented behavior.

### Why Does This Matter?
In platform operations and release management, the distinction between breaking and non-breaking changes is critical for:
1. **System Stability**: Breaking changes can cause outages or failures if not managed properly.
2. **Developer Experience**: Frequent or poorly communicated breaking changes erode trust and adoption.
3. **Release Planning**: Properly categorizing changes ensures smoother rollouts and predictable impact.

### Best Practices for Managing Changes
1. **Versioning**: Use semantic versioning (e.g., `MAJOR.MINOR.PATCH`) to signal the type of change. Increment the major version for breaking changes and the minor version for non-breaking changes.
2. **Deprecation Policies**: For breaking changes, provide a deprecation period where old functionality is supported alongside the new.
3. **Communication**: Publish release notes, migration guides, and timelines for breaking changes. Use tools like changelogs and API documentation to keep consumers informed.
4. **Testing**: Implement automated regression tests to verify that non-breaking changes do not inadvertently introduce breaking behavior.

### How It Fits into the Broader Domain
In the **platform_ops** and **release_management** domains, managing breaking and non-breaking changes is a core responsibility. It ensures that systems evolve without compromising reliability or user satisfaction. This aligns with the **IT_END_TO_END** pillar by enabling seamless integration and operation across the software lifecycle.

## Links
- **Semantic Versioning**: Guidelines for versioning systems to signal breaking and non-breaking changes.
- **Backward Compatibility Testing**: Best practices for ensuring changes do not disrupt existing functionality.
- **Deprecation Policies**: Strategies for phasing out old features while minimizing consumer impact.
- **Release Management Frameworks**: Industry-standard methodologies for planning and executing software releases.

## Proof / Confidence
This content is based on industry standards such as Semantic Versioning (semver.org) and best practices outlined in release management frameworks like ITIL and Agile methodologies. These approaches are widely adopted across the software industry, ensuring reliability and predictability in managing changes.
