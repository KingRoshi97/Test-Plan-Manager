---
kid: "KID-ITARCH-PITFALL-0001"
title: "\"Microservices by default\" failure modes"
content_type: "reference"
primary_domain: "software_delivery"
secondary_domains:
  - "architecture_design"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "a"
  - "r"
  - "c"
  - "h"
  - "i"
  - "t"
  - "e"
  - "c"
  - "t"
  - "u"
  - "r"
  - "e"
  - ","
  - " "
  - "m"
  - "i"
  - "c"
  - "r"
  - "o"
  - "s"
  - "e"
  - "r"
  - "v"
  - "i"
  - "c"
  - "e"
  - "s"
  - ","
  - " "
  - "a"
  - "n"
  - "t"
  - "i"
  - "-"
  - "p"
  - "a"
  - "t"
  - "t"
  - "e"
  - "r"
  - "n"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/architecture_design/pitfalls/KID-ITARCH-PITFALL-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# "Microservices by default" failure modes

# Microservices by Default Failure Modes

## Summary

The "microservices by default" approach refers to prematurely or unnecessarily adopting a microservices architecture without sufficient justification or preparation. While microservices can offer scalability, flexibility, and fault isolation, adopting them without a clear business or technical need often leads to increased complexity, poor performance, and operational challenges. This pitfall arises when teams prioritize trends over practicality, leading to architectural decisions that hinder, rather than help, software delivery.

---

## When to Use

This warning applies in the following scenarios:

- **Greenfield Projects**: Teams starting new projects default to microservices without evaluating simpler alternatives like monoliths.
- **Legacy System Modernization**: Organizations migrating from monolithic architectures assume microservices are the only viable modernization path.
- **Scalability or Performance Needs**: Teams assume microservices are the solution to scaling challenges without first addressing bottlenecks in their monolithic system.
- **Organizational Mandates**: Leadership mandates microservices adoption as part of a broader digital transformation initiative without considering team readiness or system requirements.

---

## Do / Don't

### Do:
1. **Do evaluate simpler architectures first**: Start with a modular monolith and assess whether microservices are truly necessary.
2. **Do align architecture with business needs**: Ensure the architecture supports measurable business outcomes like faster delivery or improved scalability.
3. **Do invest in operational readiness**: Build expertise in observability, CI/CD pipelines, and distributed system management before adopting microservices.

### Don't:
1. **Don't adopt microservices for trend-following**: Avoid choosing microservices simply because they are popular or "modern."
2. **Don't underestimate operational complexity**: Recognize that microservices require robust tooling, monitoring, and deployment practices.
3. **Don't ignore team maturity**: Avoid microservices if your team lacks experience with distributed systems or DevOps practices.

---

## Core Content

### The Mistake

The "microservices by default" pitfall occurs when teams adopt microservices without a clear understanding of their trade-offs or without a compelling reason. This often stems from a desire to follow industry trends, emulate successful tech companies, or address perceived limitations of monolithic systems without fully exploring alternatives.

Microservices architectures are inherently complex. They introduce challenges such as distributed data consistency, network latency, inter-service communication, and operational overhead. Without a strong justification, these challenges can outweigh the benefits.

### Why People Make This Mistake

1. **Hype-driven development**: Teams feel pressured to adopt microservices because they are widely discussed in the industry.
2. **Misunderstanding scalability**: Teams assume microservices are the only way to scale applications, ignoring that monoliths can scale effectively with proper design.
3. **Overgeneralizing success stories**: Companies like Netflix and Amazon are often cited as microservices success stories, but their contexts (e.g., scale, team size, and resources) differ significantly from most organizations.

### Consequences

- **Operational Overhead**: Managing multiple services increases the burden on DevOps teams, requiring advanced monitoring, logging, and alerting systems.
- **Increased Latency and Failures**: Network communication between services introduces latency and potential failure points.
- **Slower Development**: Coordinating changes across multiple services can slow down feature delivery, especially if teams lack strong DevOps practices.
- **Team Burnout**: Developers and operators may feel overwhelmed by the complexity of managing a distributed system.

### How to Detect It

- **High service count with unclear boundaries**: If your system has many services but no clear rationale for their separation, you may be overusing microservices.
- **Operational struggles**: Frequent outages, difficulty in debugging, or slow deployments may indicate that your team is unprepared for microservices.
- **No measurable benefits**: If microservices adoption has not improved scalability, fault isolation, or delivery speed, it may have been unnecessary.

### How to Fix or Avoid It

1. **Start with a modular monolith**: Design your application as a single deployable unit with clear internal boundaries. This allows you to refactor into microservices later if needed.
2. **Define service boundaries carefully**: Use domain-driven design (DDD) to identify bounded contexts and ensure services align with business capabilities.
3. **Invest in tooling and practices**: Before adopting microservices, ensure your team has strong CI/CD pipelines, automated testing, and observability tools.
4. **Pilot microservices in a low-risk area**: Test the approach on a non-critical part of the system to evaluate its feasibility and impact.
5. **Reassess regularly**: Continuously evaluate whether your architecture meets your business and technical needs. Be willing to pivot if microservices are not delivering value.

### Real-World Scenario

A mid-sized e-commerce company decided to migrate their monolithic application to microservices after attending a tech conference. They split their application into dozens of services, each managed by a small team. However, they lacked experience with distributed systems and did not invest in proper observability tools. As a result, they faced frequent outages due to cascading failures, struggled to debug issues, and saw delivery times slow down due to inter-service dependencies. After reassessing their approach, they consolidated several services back into a modular monolith, retaining microservices only for high-traffic components like search and payments.

---

## Links

- **Domain-Driven Design (DDD)**: Learn how to define service boundaries using bounded contexts.
- **Monolith to Microservices Migration Strategies**: Explore strategies for incrementally migrating from a monolith to microservices.
- **Observability Best Practices**: Understand the importance of monitoring, logging, and tracing in distributed systems.
- **12-Factor App Principles**: Guidelines for designing scalable and maintainable cloud-native applications.

---

## Proof / Confidence

This content is supported by industry best practices and expert recommendations:

- **Martin Fowler's "Monolith First" Principle**: Fowler advocates starting with a monolith to simplify initial development and only transitioning to microservices when justified.
- **Google's Site Reliability Engineering (SRE) Practices**: Google's SRE handbook emphasizes the importance of operational readiness before adopting complex architectures.
- **Case Studies**: Many companies, including Uber and Spotify, have publicly shared lessons learned from premature microservices adoption, highlighting the importance of team maturity and operational investment.
