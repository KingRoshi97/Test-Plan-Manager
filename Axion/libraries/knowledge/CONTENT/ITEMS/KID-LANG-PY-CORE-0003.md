---
kid: "KID-LANG-PY-CORE-0003"
title: "Testing Norms (pytest baseline)"
content_type: "concept"
primary_domain: "["
secondary_domains:
  - "p"
  - "y"
  - "t"
  - "h"
  - "o"
  - "n"
  - "]"
industry_refs: []
stack_family_refs:
  - "language_core"
pillar_refs:
  - "technology_knowledge"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "p"
  - "y"
  - "t"
  - "h"
  - "o"
  - "n"
  - ","
  - " "
  - "t"
  - "e"
  - "s"
  - "t"
  - "i"
  - "n"
  - "g"
  - ","
  - " "
  - "p"
  - "y"
  - "t"
  - "e"
  - "s"
  - "t"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/python/language_core/KID-LANG-PY-CORE-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Testing Norms (pytest baseline)

# Testing Norms (pytest baseline)

## Summary
`pytest` is a widely-used Python testing framework that simplifies the process of writing and running tests. It provides powerful features like fixtures, parameterized testing, and detailed reporting, making it a strong baseline for testing norms in Python projects. Establishing a consistent `pytest` baseline ensures maintainable, scalable, and reliable test suites across software projects.

## When to Use
- **Unit Testing**: To test individual functions or methods in isolation.
- **Integration Testing**: To validate the interaction between multiple components.
- **Regression Testing**: To ensure new changes do not break existing functionality.
- **Test-Driven Development (TDD)**: To write tests before implementing functionality.
- **Continuous Integration Pipelines**: To automate test execution as part of CI/CD workflows.
- **Open Source Projects**: To enforce consistent testing practices across contributors.

## Do / Don't

### Do
1. **Use Fixtures for Reusability**: Define reusable setup and teardown logic using `pytest` fixtures.
2. **Write Parameterized Tests**: Use `@pytest.mark.parametrize` to test multiple input/output scenarios with minimal code duplication.
3. **Leverage Assertions**: Use Python's built-in `assert` statements for readable and concise test validations.

### Don't
1. **Don't Hardcode Test Data**: Use fixtures or parameterization instead of embedding static data directly in tests.
2. **Don't Overuse Mocks**: Mocking should be limited to external dependencies, not core application logic.
3. **Don't Skip Tests Without Reason**: Avoid using `@pytest.mark.skip` unless there is a documented, valid reason.

## Core Content
`pytest` is a Python testing framework designed to make testing simple and scalable. It supports a variety of testing needs, from simple unit tests to complex functional and integration tests. By adhering to `pytest` as a baseline for testing norms, teams can ensure consistency, readability, and maintainability in their test suites.

### Key Features of `pytest`
1. **Fixtures**: Fixtures allow you to define reusable setup and teardown logic for your tests. For example:
   ```python
   import pytest

   @pytest.fixture
   def sample_data():
       return {"key": "value"}

   def test_sample_data(sample_data):
       assert sample_data["key"] == "value"
   ```
   Fixtures improve test readability and reduce redundancy.

2. **Parameterized Testing**: The `@pytest.mark.parametrize` decorator enables you to test multiple input/output combinations efficiently:
   ```python
   @pytest.mark.parametrize("input,expected", [
       (1, 2),
       (2, 4),
       (3, 6),
   ])
   def test_double(input, expected):
       assert input * 2 == expected
   ```
   This approach avoids writing repetitive test cases for similar logic.

3. **Plugins and Extensions**: `pytest` has a rich ecosystem of plugins, such as `pytest-django` for testing Django applications or `pytest-cov` for measuring code coverage.

4. **Detailed Reporting**: `pytest` provides clear and detailed test reports, including stack traces and test durations, which help in debugging and optimizing tests.

5. **Test Discovery**: `pytest` automatically discovers tests based on naming conventions (e.g., files starting with `test_` or classes/methods prefixed with `Test`), reducing boilerplate code.

### Why a `pytest` Baseline Matters
A consistent `pytest` baseline ensures that all developers follow the same testing practices, leading to:
- **Improved Code Quality**: Comprehensive tests catch bugs early in development.
- **Ease of Collaboration**: Standardized tests make it easier for teams to understand and contribute to the codebase.
- **Scalability**: Modular and reusable test components (e.g., fixtures) allow test suites to grow alongside the application.

### Example Workflow
1. Write a test function using `pytest`:
   ```python
   def test_addition():
       assert 1 + 1 == 2
   ```
2. Run tests with `pytest`:
   ```bash
   pytest
   ```
3. View the results:
   ```
   ==================== test session starts ====================
   collected 1 item

   test_example.py .                                         [100%]

   ==================== 1 passed in 0.01s ====================
   ```

### Best Practices
- Use descriptive test names (e.g., `test_user_login_valid_credentials`).
- Organize tests into modules and directories for clarity.
- Integrate `pytest` with CI/CD tools like GitHub Actions or Jenkins for automated test execution.

## Links
- **pytest Documentation**: Comprehensive guide to `pytest` features and usage.
- **PEP 8 - Style Guide for Python Code**: Best practices for writing clean and maintainable Python code.
- **Test-Driven Development (TDD)**: A software development methodology that pairs well with `pytest`.
- **pytest Plugins**: Explore the extensive ecosystem of plugins to extend `pytest` functionality.

## Proof / Confidence
- **Industry Adoption**: `pytest` is one of the most popular Python testing frameworks, used by organizations like Mozilla, Dropbox, and Red Hat.
- **Community Support**: With over 10,000 stars on GitHub and an active developer community, `pytest` is well-documented and regularly updated.
- **Benchmarks**: Studies show that automated testing reduces bugs and improves software reliability, and `pytest` is a proven tool for achieving these outcomes.
