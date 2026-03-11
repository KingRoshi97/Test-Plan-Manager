---
kid: "KID-LANG-PY-FASTAPI-0003"
title: "Validation + Schemas Pattern (pydantic)"
content_type: "pattern"
primary_domain: "["
secondary_domains:
  - "p"
  - "y"
  - "t"
  - "h"
  - "o"
  - "n"
  - ","
  - " "
  - "f"
  - "a"
  - "s"
  - "t"
  - "a"
  - "p"
  - "i"
  - "]"
industry_refs: []
stack_family_refs:
  - "frameworks"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "f"
  - "a"
  - "s"
  - "t"
  - "a"
  - "p"
  - "i"
  - ","
  - " "
  - "v"
  - "a"
  - "l"
  - "i"
  - "d"
  - "a"
  - "t"
  - "i"
  - "o"
  - "n"
  - ","
  - " "
  - "p"
  - "y"
  - "d"
  - "a"
  - "n"
  - "t"
  - "i"
  - "c"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/python/frameworks/fastapi/KID-LANG-PY-FASTAPI-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Validation + Schemas Pattern (pydantic)

# Validation + Schemas Pattern (pydantic)

## Summary
The Validation + Schemas pattern using Pydantic is a robust approach for defining, validating, and serializing data in Python applications. It is particularly effective in FastAPI applications, where it simplifies request/response validation and enforces strict data integrity. This pattern ensures that data conforms to predefined schemas, reducing runtime errors and improving code maintainability.

---

## When to Use
- When building APIs with FastAPI or similar frameworks that require strict validation of incoming/outgoing data.
- When working with structured data that must adhere to specific types, constraints, or formats (e.g., email addresses, dates).
- When you need to serialize or deserialize data between Python objects and JSON.
- When you want to centralize validation logic to reduce redundancy and improve maintainability.

---

## Do / Don't

### Do:
1. **Use Pydantic models for request and response validation** in FastAPI endpoints to ensure data integrity.
2. **Leverage Pydantic's type annotations** (e.g., `str`, `int`, `datetime`) to enforce strict type checking.
3. **Use Pydantic validators** (`@validator`) for custom validation logic, such as checking value ranges or formats.

### Don't:
1. **Don't skip defining schemas** for API payloads; relying on raw dictionaries increases the risk of runtime errors.
2. **Don't hardcode validation logic** directly in endpoint functions; use Pydantic models to centralize and reuse validation.
3. **Don't use overly complex custom validators** if built-in field types (e.g., `EmailStr`, `conint`) can achieve the same result.

---

## Core Content

### Problem
In modern web applications, ensuring data integrity is critical. Without proper validation, APIs can accept malformed or invalid data, leading to runtime errors, security vulnerabilities, or corrupted data. Manually validating data in every endpoint is error-prone, repetitive, and hard to maintain.

### Solution
The Validation + Schemas pattern solves this by using Pydantic models to define schemas that validate data automatically. Pydantic leverages Python type hints to enforce strict typing and provides built-in tools for serialization and custom validation. This pattern integrates seamlessly with FastAPI, where Pydantic models can be used for request bodies, query parameters, and response models.

### Implementation Steps

1. **Install Pydantic and FastAPI**
   ```bash
   pip install fastapi pydantic uvicorn
   ```

2. **Define a Pydantic Model**
   Use Pydantic models to define the schema for your data.
   ```python
   from pydantic import BaseModel, EmailStr, Field

   class User(BaseModel):
       id: int
       name: str = Field(..., min_length=3, max_length=50)
       email: EmailStr
       age: int = Field(..., ge=18, le=100)  # Age must be between 18 and 100
   ```

3. **Use the Model in FastAPI Endpoints**
   FastAPI automatically validates incoming data against the model.
   ```python
   from fastapi import FastAPI

   app = FastAPI()

   @app.post("/users/")
   async def create_user(user: User):
       return {"message": "User created", "user": user}
   ```

4. **Add Custom Validation**
   Use Pydantic's `@validator` to enforce additional rules.
   ```python
   from pydantic import validator

   class User(BaseModel):
       id: int
       name: str
       email: EmailStr
       age: int

       @validator("name")
       def validate_name(cls, value):
           if not value.isalpha():
               raise ValueError("Name must contain only letters")
           return value
   ```

5. **Validate Responses**
   Use Pydantic models for response validation to ensure consistent API output.
   ```python
   @app.get("/users/{user_id}", response_model=User)
   async def get_user(user_id: int):
       return User(id=user_id, name="John Doe", email="john@example.com", age=30)
   ```

### Tradeoffs
- **Pros**:
  - Centralized validation logic improves maintainability.
  - Automatic type conversion (e.g., string to int) reduces boilerplate code.
  - Built-in support for complex data types (e.g., `datetime`, `UUID`).
- **Cons**:
  - Pydantic models can introduce a small runtime overhead.
  - Requires learning Pydantic's syntax and features.
  - May not be suitable for simple scripts or lightweight applications.

### Alternatives
- **Marshmallow**: Another library for data validation and serialization, but less tightly integrated with FastAPI.
- **Cerberus**: A lightweight validation library, but lacks type annotations and FastAPI integration.
- **Manual Validation**: Suitable for very simple use cases but not recommended for larger applications.

---

## Links
- **FastAPI Documentation**: Learn how Pydantic models integrate with FastAPI.
- **Pydantic Validators**: Explore advanced validation techniques using Pydantic.
- **Marshmallow vs. Pydantic**: Compare Pydantic with other validation libraries.
- **Python Type Hints**: Understand how type hints improve code quality.

---

## Proof / Confidence
Pydantic is widely adopted in the Python ecosystem and is the default validation library for FastAPI, a popular web framework. It adheres to Python's type hinting standards and has extensive documentation and community support. Benchmarks indicate that Pydantic offers a good balance between performance and functionality, making it a reliable choice for production-grade applications.
