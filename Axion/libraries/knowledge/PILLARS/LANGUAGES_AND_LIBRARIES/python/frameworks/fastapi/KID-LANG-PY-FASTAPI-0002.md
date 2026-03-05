---
kid: "KID-LANG-PY-FASTAPI-0002"
title: "API Structure Pattern (routers/services)"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [python, fastapi]
subdomains: []
tags: [fastapi, api, routers, services]
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

# API Structure Pattern (routers/services)

# API Structure Pattern (routers/services)

## Summary

The API Structure Pattern using routers and services is a design approach for organizing FastAPI applications. It separates routing logic from business logic, promoting modularity, scalability, and maintainability. This pattern is especially useful for medium to large-scale applications where code organization becomes critical.

---

## When to Use

- When building APIs with FastAPI that require clear separation of concerns between routing and business logic.
- In projects with multiple endpoints or modules that need to scale over time.
- When you want to enforce consistent patterns across teams for easier collaboration and onboarding.
- For applications requiring unit tests, as this pattern simplifies mocking and testing individual components.

---

## Do / Don't

### Do:
1. **Do modularize routes**: Group related routes into separate router files for better organization.
2. **Do use services for business logic**: Encapsulate non-routing logic in service classes or functions.
3. **Do use dependency injection**: Leverage FastAPI's dependency injection to pass services to routes.

### Don't:
1. **Don't mix routing and business logic**: Avoid implementing complex logic directly in route handlers.
2. **Don't hardcode dependencies**: Use dependency injection to make components testable and reusable.
3. **Don't skip validation**: Ensure request and response models are defined for all routes.

---

## Core Content

### Problem

In FastAPI applications, mixing routing logic with business logic leads to tightly coupled code that is hard to test, maintain, and scale. As the application grows, this approach results in bloated route files and duplicated logic.

### Solution

The API Structure Pattern organizes the application into two main layers:
1. **Routers**: Handle HTTP requests, route definitions, and dependency injection.
2. **Services**: Contain business logic, database operations, or external API calls.

This separation ensures modularity, making the code easier to test, maintain, and extend.

### Implementation Steps

#### 1. Create a Router File
Define routes in a dedicated file. Use FastAPI's `APIRouter` to group related endpoints.

```python
# routers/user_router.py
from fastapi import APIRouter, Depends
from services.user_service import UserService

router = APIRouter()

@router.get("/users/{user_id}")
async def get_user(user_id: int, user_service: UserService = Depends(UserService)):
    return await user_service.get_user_by_id(user_id)
```

#### 2. Create a Service File
Encapsulate business logic in a service class or function. This keeps routing logic clean and focused.

```python
# services/user_service.py
class UserService:
    async def get_user_by_id(self, user_id: int):
        # Simulate database call or external API call
        return {"id": user_id, "name": "John Doe"}
```

#### 3. Register Routers in the Main Application
Import and register routers in your FastAPI instance.

```python
# main.py
from fastapi import FastAPI
from routers.user_router import router as user_router

app = FastAPI()

app.include_router(user_router, prefix="/api/v1")
```

#### 4. Use Dependency Injection
FastAPI's `Depends` allows injecting services into route handlers, enabling easy testing and swapping of implementations.

#### 5. Add Validation with Pydantic Models
Define request and response models to ensure data consistency.

```python
# models/user.py
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
```

---

### Tradeoffs

#### Pros:
- **Modularity**: Clear separation of concerns between routing and business logic.
- **Testability**: Easier to mock and test services independently.
- **Scalability**: Supports adding new features without cluttering existing code.

#### Cons:
- **Initial setup**: Requires upfront effort to structure the application properly.
- **Overhead for small projects**: May be overkill for simple APIs with few endpoints.

---

## Links

- **FastAPI Dependency Injection**: Learn how FastAPI's `Depends` simplifies passing dependencies.
- **Pydantic Models**: Explore how Pydantic ensures data validation and serialization.
- **Modular FastAPI Applications**: Best practices for structuring scalable FastAPI apps.
- **Testing FastAPI Applications**: Techniques for testing routes and services independently.

---

## Proof / Confidence

This pattern is widely adopted in the FastAPI community and aligns with industry best practices for API design. FastAPI's documentation recommends using `APIRouter` for modularity and dependency injection for clean code. Similar patterns are used in frameworks like Flask and Django, demonstrating cross-framework applicability.
