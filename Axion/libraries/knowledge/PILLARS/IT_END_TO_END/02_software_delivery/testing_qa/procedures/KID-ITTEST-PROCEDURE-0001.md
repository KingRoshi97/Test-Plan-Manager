---
kid: "KID-ITTEST-PROCEDURE-0001"
title: "Flaky Test Triage Procedure"
type: procedure
pillar: IT_END_TO_END
domains:
  - software_delivery
  - testing_qa
subdomains: []
tags: [testing, flaky, triage]
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

# Flaky Test Triage Procedure

```markdown
# Flaky Test Triage Procedure

## Summary
Flaky tests are intermittent test failures that can obscure real issues, reduce developer confidence, and slow down delivery pipelines. This procedure outlines a systematic approach to identify, isolate, and address flaky tests to improve the reliability of your testing suite and maintain high-quality software delivery.

## When to Use
- A test fails intermittently without code changes or environmental updates.
- Developers report inconsistent results from the same test suite.
- Automated pipelines are blocked or slowed by repeated test retries.
- Test reliability metrics (e.g., pass rate) drop below acceptable thresholds.

## Do / Don't

### Do:
1. **Log flaky test occurrences** with timestamps, execution environments, and failure details.
2. **Run tests in isolation** to determine if external dependencies or shared state are causing flakiness.
3. **Prioritize flaky tests** based on their frequency and impact on the pipeline.

### Don't:
1. **Ignore flaky tests** or dismiss them as minor issues—they erode team confidence over time.
2. **Disable flaky tests permanently** without resolving the underlying issue.
3. **Assume flakiness is always due to infrastructure issues**—test logic and data dependencies are common culprits.

## Core Content

### Prerequisites
- Access to test logs, test code, and execution environments.
- Familiarity with the test framework and CI/CD pipeline.
- A defined priority system for addressing flaky tests (e.g., based on frequency or severity).

### Procedure

#### Step 1: Detect and Log the Flaky Test
- **Action**: Identify the test that fails intermittently. Use CI/CD pipeline logs or test dashboards to find patterns in failures.
- **Expected Outcome**: A clear record of the flaky test, including timestamps, error messages, and affected environments.
- **Common Failure Modes**: Missing logs or insufficient detail in error messages.

#### Step 2: Reproduce the Flakiness
- **Action**: Run the test multiple times in different environments (e.g., local, staging, CI) to confirm the flakiness.
- **Expected Outcome**: Confirmation that the test fails intermittently and is not a one-time issue.
- **Common Failure Modes**: Inability to reproduce the issue due to differences in environments or configurations.

#### Step 3: Analyze the Root Cause
- **Action**: Investigate potential causes, such as:
  - Shared state or dependencies between tests.
  - Time-sensitive logic or race conditions.
  - Environmental instability (e.g., network latency, resource constraints).
- Use debugging tools, logs, and test framework utilities to gather evidence.
- **Expected Outcome**: A hypothesis for the root cause of the flakiness.
- **Common Failure Modes**: Misidentifying the root cause due to incomplete analysis or overlooking external factors.

#### Step 4: Isolate and Fix the Issue
- **Action**: Modify the test or the code under test to address the root cause. Examples include:
  - Mocking external dependencies to remove environmental variability.
  - Adding retries or timeouts for time-sensitive operations.
  - Refactoring test logic to eliminate shared state.
- **Expected Outcome**: A fixed test that runs reliably across environments.
- **Common Failure Modes**: Introducing new issues while fixing the flaky test or failing to fully resolve the original problem.

#### Step 5: Validate the Fix
- **Action**: Run the fixed test multiple times in all relevant environments to confirm reliability.
- **Expected Outcome**: The test passes consistently without intermittent failures.
- **Common Failure Modes**: Overlooking edge cases or failing to test in all environments.

#### Step 6: Document and Monitor
- **Action**: Update test documentation with details of the fix and monitor the test's performance over time.
- **Expected Outcome**: A documented resolution and ongoing assurance of test reliability.
- **Common Failure Modes**: Failing to monitor the test, leading to regression of the issue.

## Links
- **Best Practices for Writing Reliable Tests**: Guidance on avoiding common pitfalls in test design.
- **CI/CD Pipeline Optimization**: Strategies for maintaining fast and reliable pipelines.
- **Debugging Flaky Tests**: Tools and techniques for diagnosing intermittent test failures.
- **Test Automation Metrics**: Key metrics to track for test suite health.

## Proof / Confidence
This procedure is based on industry best practices for test reliability, including guidance from the Test Automation University and DevOps Research and Assessment (DORA). Studies show that addressing flaky tests improves deployment frequency and reduces lead time for changes, aligning with high-performing software delivery benchmarks.
```
