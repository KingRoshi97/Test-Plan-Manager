---
kid: "KID-LANG-TS-CORE-0004"
title: "Testing Norms (unit/integration in JS land)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript]
subdomains: []
tags: [testing, unit-test, integration-test]
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

# Testing Norms (unit/integration in JS land)

# Testing Norms (unit/integration in JS land)

## Summary

Testing is a critical practice in JavaScript and TypeScript development, ensuring code reliability, maintainability, and scalability. Unit testing focuses on verifying individual components or functions, while integration testing ensures that multiple components work together as expected. Together, these testing types form the foundation of robust software development practices in the JavaScript ecosystem.

---

## When to Use

- **Unit Testing**: Use for isolated testing of individual functions, methods, or components, particularly for utility functions, pure functions, or reusable components.
- **Integration Testing**: Use when testing how multiple modules or components interact, such as API calls, database queries, or component rendering within a framework like React or Vue.
- **Pre-Deployment**: Always run both unit and integration tests before deploying to production to catch regressions or issues.
- **Refactoring Code**: Write or update unit tests to ensure refactored code behaves as expected.
- **Debugging Complex Bugs**: Use integration tests to replicate and validate fixes for issues that occur between interconnected systems.

---

## Do / Don't

### Do:
1. **Write Tests for Critical Logic**: Ensure all business-critical logic is covered by unit tests.
2. **Mock External Dependencies**: Use mocking libraries (e.g., Jest mocks) in unit tests to isolate the test subject.
3. **Use Integration Tests for Realistic Scenarios**: Test how actual components or services interact, such as API responses or database queries.

### Don’t:
1. **Skip Tests for Small Changes**: Even minor changes can introduce regressions; always write or update tests.
2. **Overuse Mocks in Integration Tests**: Avoid excessive mocking in integration tests, as it defeats the purpose of testing real interactions.
3. **Write Tests Without Assertions**: Ensure every test includes meaningful assertions to verify expected outcomes.

---

## Core Content

Testing in JavaScript and TypeScript development is essential for delivering reliable, maintainable code. Two primary testing types — unit and integration — serve complementary purposes.

### Unit Testing
Unit tests focus on verifying the functionality of individual units of code, such as functions, methods, or components. These tests are isolated, meaning they do not depend on external systems like databases or APIs. Unit tests are typically fast and provide immediate feedback during development.

#### Example: Unit Test for a Utility Function
```javascript
// Function to test
export const add = (a, b) => a + b;

// Unit test using Jest
import { add } from './math';

test('adds two numbers correctly', () => {
  expect(add(2, 3)).toBe(5);
});
```

### Integration Testing
Integration tests validate the interactions between multiple components or systems. These tests ensure that modules work together as intended. Unlike unit tests, integration tests often involve real or simulated external dependencies, such as APIs, databases, or file systems.

#### Example: Integration Test for an API Call
```javascript
// Function to test
import axios from 'axios';

export const fetchData = async (url) => {
  const response = await axios.get(url);
  return response.data;
};

// Integration test using Jest
import { fetchData } from './api';

jest.mock('axios'); // Mocking axios for controlled testing

test('fetches data from API', async () => {
  const mockData = { id: 1, name: 'Test' };
  axios.get.mockResolvedValueOnce({ data: mockData });

  const data = await fetchData('https://api.example.com/data');
  expect(data).toEqual(mockData);
  expect(axios.get).toHaveBeenCalledWith('https://api.example.com/data');
});
```

### Key Differences
- **Scope**: Unit tests cover small, isolated pieces of code, while integration tests cover interactions between multiple components.
- **Speed**: Unit tests are faster due to their isolation, whereas integration tests can be slower because they involve more complexity.
- **Purpose**: Unit tests ensure individual correctness, while integration tests ensure system coherence.

### Best Practices
1. **Test Coverage**: Aim for high coverage in unit tests for critical logic and reasonable coverage in integration tests for key workflows.
2. **Test Pyramid**: Follow the testing pyramid principle — write more unit tests than integration tests to maintain efficiency and reliability.
3. **Automation**: Automate running both unit and integration tests in CI/CD pipelines to catch issues early.

---

## Links

- **Testing Pyramid**: A conceptual model for balancing unit, integration, and end-to-end tests.
- **Jest Documentation**: Comprehensive guide for JavaScript testing using Jest.
- **Mocking in Jest**: Techniques for mocking dependencies in unit and integration tests.
- **React Testing Library**: A library for testing React components with a focus on user interactions.

---

## Proof / Confidence

This content is based on established industry practices and widely accepted standards in software testing. The testing pyramid is a recognized model for balancing test types. Libraries like Jest and React Testing Library are industry benchmarks, used by companies like Facebook and Airbnb. Additionally, the examples provided align with best practices outlined in documentation and community guidelines for JavaScript and TypeScript testing.
