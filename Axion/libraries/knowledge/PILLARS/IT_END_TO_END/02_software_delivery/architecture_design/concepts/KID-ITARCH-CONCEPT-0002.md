---
kid: "KID-ITARCH-CONCEPT-0002"
title: "DDD Basics (entities, value objects, bounded contexts)"
type: concept
pillar: IT_END_TO_END
domains:
  - software_delivery
  - architecture_design
subdomains: []
tags: [ddd, domain-driven-design, entities]
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

# DDD Basics (entities, value objects, bounded contexts)

# DDD Basics (Entities, Value Objects, Bounded Contexts)

## Summary
Domain-Driven Design (DDD) is a software design approach that emphasizes aligning software models with business domains. Key concepts include **entities**, which represent unique domain objects; **value objects**, which are immutable and defined by their attributes; and **bounded contexts**, which define clear boundaries for consistent domain models. DDD helps teams manage complexity and ensure software reflects business requirements.

---

## When to Use
- **Complex Domains**: Apply DDD when working in domains with intricate business rules or processes.
- **Collaborative Development**: Use DDD when close collaboration between domain experts and developers is feasible.
- **Long-Term Projects**: DDD is beneficial in projects requiring scalability, maintainability, and adaptability over time.
- **Microservices Architecture**: Leverage bounded contexts to define clear service boundaries in distributed systems.
- **Domain-Driven Refactoring**: Use DDD to restructure legacy systems to align with current business needs.

---

## Do / Don't

### Do:
1. **Collaborate with Domain Experts**: Work closely with stakeholders to ensure the model reflects the business domain accurately.
2. **Define Bounded Contexts Clearly**: Establish clear boundaries for domain models to avoid ambiguity and coupling.
3. **Use Value Objects for Immutability**: Represent concepts like money or dates as value objects to ensure consistency and avoid unintended side effects.

### Don't:
1. **Skip Ubiquitous Language**: Avoid using inconsistent terminology between developers and domain experts.
2. **Over-Engineer**: Don’t apply DDD to simple domains where the overhead outweighs the benefits.
3. **Ignore Context Boundaries**: Avoid sharing domain models across contexts, as this can lead to coupling and misalignment.

---

## Core Content

### Entities
Entities are objects that have a unique identity and persist over time. Their identity distinguishes them from other objects, even if their attributes change. For example, in an e-commerce domain, a `Customer` entity might have attributes like name and email, but its identity (e.g., `customerId`) remains constant.

**Key Characteristics:**
- Unique identifier (e.g., `id`).
- Mutable attributes.
- Lifecycle management (e.g., creation, updates, deletion).

**Example:**
```java
class Customer {
    private String id;
    private String name;
    private String email;

    // Getters, setters, and business logic methods
}
```

### Value Objects
Value objects are immutable and defined by their attributes rather than identity. They represent descriptive aspects of the domain, such as measurements or monetary values. For example, a `Money` value object could encapsulate an amount and currency.

**Key Characteristics:**
- No unique identifier.
- Immutable (state cannot change after creation).
- Used for calculations, comparisons, or as attributes of entities.

**Example:**
```java
class Money {
    private final BigDecimal amount;
    private final String currency;

    public Money(BigDecimal amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    // Getters and methods for operations like add, subtract
}
```

### Bounded Contexts
A bounded context defines the boundary within which a specific domain model applies. It ensures that terms and concepts are consistent within a context and allows different models to coexist without conflict. For example, in an enterprise system, the concept of "Order" might mean different things in the `Sales` and `Shipping` contexts.

**Key Characteristics:**
- Defines clear boundaries for models.
- Enables modularity and decoupling.
- Facilitates communication between contexts via integration patterns (e.g., events, APIs).

**Example:**
In a microservices architecture:
- `Sales` context: An `Order` represents a customer purchase.
- `Shipping` context: An `Order` represents a delivery package.

**Integration Example:**
- Use an event-driven approach where the `Sales` context publishes an `OrderPlaced` event, and the `Shipping` context subscribes to it.

### Why It Matters
DDD helps manage complexity by aligning software with business requirements. Entities and value objects ensure that the domain is modeled accurately, while bounded contexts prevent ambiguity and coupling. Together, these concepts enable scalable, maintainable, and adaptable systems.

---

## Links
- **Ubiquitous Language**: Learn how shared terminology bridges the gap between domain experts and developers.
- **Event-Driven Architecture**: Explore how events facilitate communication between bounded contexts.
- **Microservices Design**: Understand how DDD principles guide service boundaries in distributed systems.
- **Strategic Design in DDD**: Dive deeper into tactical and strategic patterns for managing complexity.

---

## Proof / Confidence
- **Industry Adoption**: DDD is widely used in complex domains like finance, healthcare, and e-commerce.
- **Eric Evans' Book**: "Domain-Driven Design: Tackling Complexity in the Heart of Software" is a foundational text in software architecture.
- **Microservices Standards**: DDD principles align with best practices for defining service boundaries in microservices.
- **Case Studies**: Companies like Netflix and Amazon have successfully applied DDD concepts to scale their systems.
