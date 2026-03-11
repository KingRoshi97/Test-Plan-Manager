---
kid: "KID-ITARCH-REF-0001"
title: "Common Architecture Terms Reference"
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
  - "g"
  - "l"
  - "o"
  - "s"
  - "s"
  - "a"
  - "r"
  - "y"
  - ","
  - " "
  - "t"
  - "e"
  - "r"
  - "m"
  - "s"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/architecture_design/references/KID-ITARCH-REF-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Common Architecture Terms Reference

```markdown
# Common Architecture Terms Reference

## Summary
This document provides a concise reference for common architecture terms used in software delivery and architecture design. It includes definitions, parameters, and configuration options to support IT end-to-end processes. The goal is to ensure consistent understanding and application of these terms across engineering teams.

## When to Use
- During architecture design and review sessions to ensure consistent terminology.
- When documenting system designs, technical specifications, or architecture diagrams.
- To onboard new team members or stakeholders unfamiliar with architecture concepts.
- For aligning cross-functional teams on software delivery practices.

## Do / Don't

### Do:
- **Use standardized terms**: Refer to this guide to ensure consistent usage of architecture terminology.
- **Document architecture decisions**: Clearly define how terms are applied in your design.
- **Validate against industry standards**: Ensure your architecture aligns with established frameworks (e.g., TOGAF, C4 Model).

### Don't:
- **Use ambiguous terminology**: Avoid inventing new terms or using terms inconsistently.
- **Ignore dependencies**: Always account for how components interact within the architecture.
- **Overcomplicate designs**: Use terms to simplify and clarify, not to obscure.

## Core Content

### Key Architecture Terms

| **Term**                  | **Definition**                                                                                                                                                                                                 |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Monolith**              | A software architecture where all components are tightly integrated into a single application.                                                                                                               |
| **Microservices**         | An architectural style where applications are composed of small, independent services that communicate over a network.                                                                                       |
| **Service-Oriented Architecture (SOA)** | A design pattern where services are reusable, loosely coupled, and communicate via well-defined interfaces.                                                                                      |
| **API Gateway**           | A server that acts as an entry point for APIs, handling routing, authentication, and rate limiting.                                                                                                          |
| **Load Balancer**         | A component that distributes network or application traffic across multiple servers to ensure reliability and performance.                                                                                   |
| **Data Lake**             | A centralized repository for storing raw, unstructured, and structured data at scale.                                                                                                                        |
| **Event-Driven Architecture (EDA)** | A design paradigm where components communicate through events, enabling asynchronous and decoupled interactions.                                                                                  |
| **Scalability**           | The ability of a system to handle increased load by adding resources, either horizontally (adding more instances) or vertically (upgrading existing resources).                                               |
| **High Availability (HA)**| A system design approach that ensures minimal downtime by eliminating single points of failure and providing redundancy.                                                                                     |
| **Technical Debt**        | The cost of additional rework caused by choosing an easy or limited solution instead of a more robust approach that would take longer.                                                                        |

### Parameters and Configuration Options

| **Parameter**             | **Description**                                                                                      | **Example Value(s)**                  |
|---------------------------|------------------------------------------------------------------------------------------------------|---------------------------------------|
| **Latency**               | The time delay between a request and response in a system.                                           | Measured in milliseconds (e.g., 100ms)|
| **Throughput**            | The number of requests a system can handle per second.                                               | 10,000 requests/second                |
| **Fault Tolerance**       | The ability of a system to continue functioning despite failures.                                     | Enabled/Disabled                      |
| **Replication Factor**    | The number of copies of data stored across nodes for redundancy.                                      | 3                                     |
| **Cache Expiry**          | The duration for which cached data remains valid.                                                    | 60 seconds                            |

### Architecture Layers

| **Layer**                 | **Purpose**                                                                                         | **Example Components**                |
|---------------------------|-----------------------------------------------------------------------------------------------------|---------------------------------------|
| **Presentation Layer**    | Manages user interaction and displays data.                                                         | Web UI, Mobile App                    |
| **Application Layer**     | Handles business logic and processing.                                                              | Microservices, APIs                   |
| **Data Layer**            | Stores and retrieves data.                                                                          | Databases, Data Lakes                 |
| **Infrastructure Layer**  | Provides the underlying hardware and network resources.                                             | Servers, Load Balancers, Cloud Services|

## Links
- **TOGAF Framework**: A widely adopted standard for enterprise architecture.
- **C4 Model**: A visual framework for documenting software architecture.
- **12-Factor App**: Best practices for building scalable and maintainable software-as-a-service applications.
- **Event-Driven Architecture Principles**: Guidelines for designing systems based on event-driven interactions.

## Proof / Confidence
- **TOGAF and C4 Model**: These are industry-standard frameworks widely used for architecture design.
- **Best Practices**: Terms and definitions align with benchmarks from organizations like AWS, Azure, and Google Cloud.
- **Adoption**: Concepts such as microservices, API gateways, and event-driven architectures are proven in production systems across industries.
```
