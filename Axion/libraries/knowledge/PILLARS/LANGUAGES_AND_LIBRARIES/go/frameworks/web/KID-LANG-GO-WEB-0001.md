---
kid: "KID-LANG-GO-WEB-0001"
title: "Go API Structure Pattern"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [go]
subdomains: []
tags: [go, api, web, structure]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Go API Structure Pattern

# Go API Structure Pattern

## Summary

The Go API Structure Pattern is a design approach for organizing APIs in Go applications to ensure scalability, maintainability, and clarity. It emphasizes modularity, clear separation of concerns, and idiomatic Go practices. This pattern is particularly useful for building RESTful or RPC-based APIs while adhering to Go's conventions.

---

## When to Use

- When building APIs in Go that need to scale as the application grows.
- When you want to ensure your API is easy to maintain and extend.
- When you need to enforce clear separation between business logic, request handling, and data access layers.
- When working in teams where consistent structure improves collaboration and reduces onboarding time.

---

## Do / Don't

### Do:
1. **Use interfaces to define contracts** for services and repositories to enable mocking and testing.
2. **Organize code into packages** (e.g., `handlers`, `services`, `repositories`) to separate concerns.
3. **Follow idiomatic Go naming conventions** for clarity and readability.
4. **Implement middleware** for cross-cutting concerns like logging, authentication, and error handling.
5. **Use dependency injection** to decouple components and improve testability.

### Don't:
1. **Mix business logic with request handling** in your handlers.
2. **Hardcode dependencies** directly in your code; use constructors or dependency injection.
3. **Create overly nested packages** that complicate navigation and understanding.
4. **Ignore error handling**; always return and log meaningful errors.
5. **Expose internal details** of your API structure, such as database models, directly in your API responses.

---

## Core Content

### Problem

Go applications often grow in complexity as features are added, leading to tightly coupled code that is difficult to maintain and test. Without a clear structure, APIs can become disorganized, mixing business logic, data access, and request handling, resulting in poor scalability and high technical debt.

### Solution Approach

The Go API Structure Pattern provides a modular structure that separates concerns and enforces clean, maintainable code. The structure typically includes the following layers:

1. **Handlers (Controllers)**: Handle HTTP requests, validate inputs, and delegate to services.
2. **Services**: Contain business logic and orchestrate operations across repositories.
3. **Repositories**: Interact with the database or external data sources.
4. **Models**: Represent data structures used across layers.
5. **Middleware**: Implement cross-cutting concerns like logging, authentication, and metrics.

### Implementation Steps

#### 1. Define the Project Structure
Organize your project into packages based on functionality:
```
/api
    /handlers
    /services
    /repositories
    /models
    /middleware
```

#### 2. Create Interfaces for Services and Repositories
Define interfaces to decouple components:
```go
// UserService defines the contract for user-related operations.
type UserService interface {
    CreateUser(ctx context.Context, user User) error
    GetUserByID(ctx context.Context, id int) (User, error)
}

// UserRepository defines the contract for database operations.
type UserRepository interface {
    Save(ctx context.Context, user User) error
    FindByID(ctx context.Context, id int) (User, error)
}
```

#### 3. Implement Handlers
Handlers should focus on request validation and delegation:
```go
func CreateUserHandler(svc UserService) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var user User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        if err := svc.CreateUser(r.Context(), user); err != nil {
            http.Error(w, "Failed to create user", http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusCreated)
    }
}
```

#### 4. Implement Services
Services contain business logic:
```go
type userService struct {
    repo UserRepository
}

func (s *userService) CreateUser(ctx context.Context, user User) error {
    // Business logic, e.g., validation
    return s.repo.Save(ctx, user)
}
```

#### 5. Implement Repositories
Repositories handle data access:
```go
type userRepository struct {
    db *sql.DB
}

func (r *userRepository) Save(ctx context.Context, user User) error {
    _, err := r.db.ExecContext(ctx, "INSERT INTO users (name, email) VALUES (?, ?)", user.Name, user.Email)
    return err
}
```

#### 6. Add Middleware
Middleware handles cross-cutting concerns:
```go
func LoggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Request: %s %s", r.Method, r.URL.Path)
        next.ServeHTTP(w, r)
    })
}
```

### Tradeoffs
- **Pros**:
  - Clear separation of concerns improves maintainability.
  - Testability is enhanced through interfaces and dependency injection.
  - Scalability is easier due to modular design.

- **Cons**:
  - Initial setup requires more boilerplate code.
  - Developers must adhere to the structure, which may feel restrictive for small projects.

### When to Use Alternatives
- For small projects or prototypes, a simpler structure with combined handlers and logic may suffice.
- In microservices where the API is minimal, you may not need full separation of concerns.

---

## Links

- **Go Project Layout**: A widely adopted standard for structuring Go projects.
- **RESTful API Design Principles**: Best practices for building REST APIs.
- **Dependency Injection in Go**: Techniques for decoupling components.
- **Middleware Patterns in Go**: Practical examples of middleware implementation.

---

## Proof / Confidence

This pattern is widely used in production-grade Go applications and aligns with industry standards like the [Go Project Layout](https://github.com/golang-standards/project-layout). It is recommended by Go experts in the community and demonstrated in popular frameworks like Echo and Gin. Following this structure ensures adherence to idiomatic Go practices and improves code quality.
