---
kid: "KID-ITARCH-PITFALL-0002"
title: "Shared DB coupling across services"
type: pitfall
pillar: IT_END_TO_END
domains:
  - software_delivery
  - architecture_design
subdomains: []
tags: [architecture, database, coupling]
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

# Shared DB coupling across services

# Shared DB Coupling Across Services

## Summary
Shared database (DB) coupling occurs when multiple services directly access and depend on the same database schema or tables. While it may seem like a convenient way to share data, this approach tightly couples services, undermining modularity and scalability. This pitfall often leads to cascading failures, deployment bottlenecks, and long-term technical debt.

---

## When to Use
This warning applies to distributed systems, microservices architectures, or any software design where services are intended to operate independently. It is particularly relevant when:

- Teams are transitioning from a monolithic architecture to microservices.
- Services need to access the same data (e.g., customer profiles, inventory, or transactions).
- Database schema changes are frequent and impact multiple services.
- Teams prioritize rapid delivery over long-term architectural health.

---

## Do / Don't

### Do:
1. **Do design APIs for data access**: Use service-specific APIs to encapsulate database interactions and provide controlled access to data.
2. **Do enforce service boundaries**: Ensure each service owns its data and database schema to maintain independence.
3. **Do monitor database access patterns**: Use tools to identify cross-service queries and shared schema dependencies.

### Don't:
1. **Don't allow direct database access across services**: Avoid giving multiple services credentials to the same database.
2. **Don't share database tables or schemas**: Each service should have its own schema, even if the physical database is shared.
3. **Don't delay addressing shared DB coupling**: The longer this pattern persists, the harder it becomes to untangle.

---

## Core Content

### The Mistake
Shared DB coupling happens when multiple services directly access the same database tables or schema. For example, a "Customer" table might be read and written to by both a "Billing Service" and a "Marketing Service." This often arises from a desire to avoid duplicating data or to save time during development.

### Why People Make This Mistake
1. **Perceived simplicity**: Developers may think it's easier to share a database than to create APIs or event-driven mechanisms for data sharing.
2. **Legacy systems**: Teams migrating from monolithic systems often retain shared database patterns.
3. **Short-term deadlines**: Under time pressure, teams may prioritize immediate functionality over architectural best practices.

### Consequences
1. **Tight coupling**: Changes to the database schema require coordination across all dependent services, slowing down development and deployment.
2. **Cascading failures**: A failure in one service can corrupt shared data or make it unavailable to other services.
3. **Deployment bottlenecks**: Shared DB coupling necessitates synchronized deployments, reducing the autonomy of individual teams.
4. **Scalability limitations**: Shared databases can become a performance bottleneck as traffic grows, limiting the scalability of the system.
5. **Data integrity risks**: Competing read/write operations across services can lead to race conditions and data inconsistencies.

### How to Detect It
1. **Shared credentials**: Check if multiple services use the same database credentials.
2. **Cross-service queries**: Look for SQL queries that span multiple services' tables.
3. **Schema coupling**: Identify database schema changes that require updates across multiple services.
4. **Deployment dependencies**: Notice if services must be deployed together due to shared database changes.

### How to Fix or Avoid It
1. **Adopt a database-per-service pattern**: Each service should have its own database or schema, even if they share the same physical database server.
2. **Use APIs for data sharing**: Services needing access to another service's data should use APIs or event-driven mechanisms like message queues (e.g., Kafka, RabbitMQ).
3. **Implement data replication**: If multiple services need the same data, replicate it in their respective databases using eventual consistency patterns.
4. **Refactor legacy systems incrementally**: For existing shared databases, gradually refactor to separate schemas or databases, starting with the most critical services.
5. **Educate teams**: Train developers on the risks of shared DB coupling and the importance of service boundaries.

### Real-World Scenario
Consider an e-commerce platform where the "Order Service" and "Inventory Service" share a database. The "Order Service" updates the stock levels in the "Inventory" table after a purchase. Meanwhile, the "Inventory Service" directly queries the same table to display stock availability. A schema change to the "Inventory" table (e.g., renaming a column) requires simultaneous updates to both services, leading to deployment delays. Additionally, a bug in the "Order Service" corrupts stock data, causing the "Inventory Service" to show incorrect information. By decoupling these services with separate databases and APIs, each service could evolve independently and avoid cascading failures.

---

## Links
- **Database-per-Service Pattern**: A core concept in microservices architecture that promotes service independence.
- **Event-Driven Architecture**: A design approach for decoupling services through asynchronous messaging.
- **CAP Theorem**: A principle explaining trade-offs between consistency, availability, and partition tolerance in distributed systems.
- **Martin Fowler on Microservices**: Insights into microservices design principles, including database decoupling.

---

## Proof / Confidence
This content is supported by industry best practices from sources like Martin Fowler, ThoughtWorks, and the 12-Factor App methodology. The database-per-service pattern is a widely accepted standard in microservices architecture, as detailed in books like "Building Microservices" by Sam Newman. Additionally, real-world case studies (e.g., Netflix, Amazon) demonstrate the scalability and resilience benefits of avoiding shared DB coupling.
