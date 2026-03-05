---
kid: "KID-ITTEST-CHECK-0001"
title: "Test Coverage Checklist (what matters)"
type: checklist
pillar: IT_END_TO_END
domains:
  - software_delivery
  - testing_qa
subdomains: []
tags: [testing, coverage, checklist]
maturity: "reviewed"
use_policy: reusable_with_allowlist
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

# Test Coverage Checklist (what matters)

# Test Coverage Checklist (What Matters)

## Summary
Test coverage ensures that your code is adequately tested to meet quality, reliability, and maintainability standards. This checklist provides actionable steps to evaluate and improve test coverage in software delivery, focusing on areas that matter most for end-to-end IT systems. By following this checklist, teams can identify gaps, prioritize critical tests, and maintain high-quality software.

---

## When to Use
- During sprint planning or before a release to assess test completeness.
- When adding new features, refactoring, or fixing bugs to ensure changes are tested.
- As part of continuous integration/continuous delivery (CI/CD) pipelines to maintain consistent quality.
- During audits or reviews to validate compliance with quality standards.
- When investigating production issues to identify untested or under-tested areas.

---

## Do / Don't

### Do:
1. **Do prioritize critical business workflows in test coverage.**  
   Rationale: High-priority workflows directly impact user experience and business outcomes.

2. **Do measure and track code coverage metrics (e.g., line, branch, and function coverage).**  
   Rationale: Metrics provide quantifiable insights into test completeness.

3. **Do include both positive and negative test cases.**  
   Rationale: Testing edge cases and failure scenarios ensures robustness.

### Don't:
1. **Don't rely solely on code coverage percentage as a success metric.**  
   Rationale: High coverage can still miss critical business logic or edge cases.

2. **Don't skip integration and end-to-end tests in favor of unit tests only.**  
   Rationale: Real-world systems require testing across components and workflows.

3. **Don't ignore flaky tests or failing tests in CI/CD pipelines.**  
   Rationale: Flaky tests reduce trust in the test suite and can mask real defects.

---

## Core Content

### 1. **Identify Critical Areas for Testing**
   - Focus on high-impact areas such as:
     - Core business logic.
     - Security-sensitive components (e.g., authentication, authorization).
     - Frequently used APIs or endpoints.
     - Areas with frequent production issues or regressions.
   - Use risk-based testing to prioritize coverage for critical workflows.

### 2. **Measure and Analyze Coverage**
   - Use tools like JaCoCo, Istanbul, or Coverlet to measure:
     - **Line coverage:** Percentage of code lines executed by tests.
     - **Branch coverage:** Percentage of decision points (e.g., `if`/`else`) tested.
     - **Function coverage:** Percentage of functions or methods executed.
   - Review reports regularly to identify gaps and low-coverage areas.

### 3. **Ensure Test Depth**
   - Write tests at multiple levels:
     - **Unit tests:** Validate individual functions or methods.
     - **Integration tests:** Verify interactions between modules or services.
     - **End-to-end tests:** Simulate real-world user workflows.
   - Include boundary and edge case testing for critical components.

### 4. **Automate Testing**
   - Integrate automated tests into CI/CD pipelines.
   - Schedule regular test runs to catch regressions early.
   - Use parallel execution to reduce test runtime.

### 5. **Address Test Gaps and Flaky Tests**
   - Review untested or under-tested code paths and add appropriate tests.
   - Investigate and fix flaky tests to improve reliability.
   - Remove obsolete or redundant tests to streamline the suite.

### 6. **Validate Non-Functional Requirements**
   - Test for performance, scalability, and security in addition to functionality.
   - Use tools like JMeter or Gatling for performance testing.
   - Perform security testing with tools like OWASP ZAP or Burp Suite.

### 7. **Review and Refactor**
   - Conduct regular test reviews to ensure relevance and effectiveness.
   - Refactor tests to improve readability, maintainability, and coverage.

---

## Links
- **Best Practices for Unit Testing:** Guidelines for writing effective unit tests.  
- **Code Coverage Metrics Explained:** Overview of line, branch, and function coverage.  
- **Continuous Testing in CI/CD Pipelines:** Strategies for integrating automated testing in delivery workflows.  
- **OWASP Testing Guide:** Comprehensive guide for security testing.

---

## Proof / Confidence
- **Industry Standards:** Practices align with ISTQB and ISO/IEC/IEEE 29119 software testing standards.  
- **Tool Adoption:** Widely used tools like JaCoCo, Istanbul, and OWASP ZAP validate the importance of measuring coverage and addressing security.  
- **Empirical Evidence:** Studies show that projects with high test coverage have fewer defects and faster delivery cycles.  
- **Common Practice:** Risk-based testing and CI/CD integration are standard in modern software delivery pipelines.  
