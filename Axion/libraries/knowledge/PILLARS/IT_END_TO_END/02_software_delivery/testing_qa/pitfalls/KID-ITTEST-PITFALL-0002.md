---
kid: "KID-ITTEST-PITFALL-0002"
title: "Flaky tests ignored until they kill velocity"
type: pitfall
pillar: IT_END_TO_END
domains:
  - software_delivery
  - testing_qa
subdomains: []
tags: [testing, flaky, velocity]
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

# Flaky tests ignored until they kill velocity

# Flaky Tests Ignored Until They Kill Velocity

## Summary
Flaky tests—tests that pass or fail inconsistently without changes to the code—are often ignored because they seem like minor nuisances. However, when left unaddressed, they can erode team confidence in the test suite, create bottlenecks in CI/CD pipelines, and ultimately kill development velocity. This pitfall is preventable with proactive detection and remediation strategies.

---

## When to Use
This guidance applies in the following scenarios:
- Teams frequently rerun tests to bypass failures during CI/CD builds.
- Developers dismiss test failures as "flaky" without investigating root causes.
- Flaky tests are marked as "ignored" or "skipped" indefinitely, accumulating technical debt.
- QA or testing teams struggle to maintain reliable test environments.
- Velocity metrics (e.g., deploy frequency, lead time) are declining due to unreliable test feedback loops.

---

## Do / Don't

### Do:
1. **Do prioritize flaky test investigation**: Assign ownership to address flaky tests promptly rather than deferring indefinitely.
2. **Do monitor test reliability**: Use tooling to track test failure rates and identify patterns of flakiness.
3. **Do isolate flaky tests**: Temporarily quarantine flaky tests to prevent them from blocking the CI/CD pipeline while investigating root causes.

### Don't:
1. **Don’t ignore flaky tests**: Treat them as critical issues that undermine the integrity of your test suite.
2. **Don’t rely solely on test retries**: Re-running tests may mask the problem but doesn’t resolve underlying issues.
3. **Don’t skip root cause analysis**: Avoid assuming flakiness is due to "environment issues" without deeper investigation.

---

## Core Content

### Mistake Description
Flaky tests are tests that fail intermittently without consistent reproducibility. Teams often ignore them because addressing flakiness requires time and resources, and the failures may seem inconsequential. Over time, this leads to a culture where test failures are dismissed as unreliable noise, undermining trust in the test suite.

### Why People Make This Mistake
- **Pressure to deliver quickly**: Teams prioritize feature development over test maintenance.
- **Misplaced trust in retries**: Automated test retries can temporarily mask flakiness, creating a false sense of stability.
- **Lack of accountability**: No clear ownership for test reliability often results in flaky tests being ignored indefinitely.

### Consequences
1. **Eroded trust in CI/CD pipelines**: Developers lose confidence in automated test results, leading to manual verification and slower delivery cycles.
2. **Reduced velocity**: Flaky tests create bottlenecks during deployment, as teams spend time debugging failures instead of shipping features.
3. **Accumulated technical debt**: Ignored flaky tests compound over time, making the test suite increasingly unreliable.
4. **Risk of undetected regressions**: Flaky tests may fail to detect critical bugs, exposing the product to production issues.

### How to Detect Flaky Tests
- **Failure pattern analysis**: Use test analytics tools to identify tests with inconsistent pass/fail rates.
- **Environment-specific failures**: Look for tests that fail only in certain environments or configurations.
- **Frequent retries**: Monitor CI/CD logs for tests that require multiple retries to pass.

### How to Fix or Avoid This Pitfall
1. **Automate flaky test detection**: Implement tooling that flags tests with inconsistent results over time.
2. **Establish ownership**: Assign a dedicated team or individual to investigate and fix flaky tests.
3. **Quarantine flaky tests**: Move unreliable tests to a separate suite to prevent them from blocking critical workflows.
4. **Root cause analysis**: Investigate common causes such as race conditions, environment dependencies, or poorly written assertions.
5. **Enforce test reliability standards**: Set thresholds for acceptable test pass rates and hold teams accountable for maintaining them.
6. **Invest in test infrastructure**: Ensure consistent environments for running tests to reduce flakiness caused by external factors.

### Real-World Scenario
A SaaS company experienced a sharp decline in deployment frequency due to unreliable CI/CD pipelines. Developers frequently encountered test failures but dismissed them as flaky, rerunning tests until they passed. Over time, the test suite accumulated over 50 flaky tests, causing significant delays in deployment and eroding team confidence in automated testing. After implementing flaky test detection tools and assigning ownership to a dedicated QA engineer, the team reduced flakiness by 80%, restored trust in the pipeline, and improved deployment frequency by 30%.

---

## Links
- **Continuous Integration Best Practices**: Guidelines for maintaining reliable CI pipelines.
- **Test Reliability Metrics**: Frameworks for measuring and improving test reliability.
- **Root Cause Analysis for Flaky Tests**: Techniques for diagnosing intermittent test failures.
- **Technical Debt in Testing**: How ignored tests contribute to long-term technical debt.

---

## Proof / Confidence
- **Industry benchmarks**: Studies show that high-performing teams prioritize test reliability to maintain velocity (e.g., DORA metrics).
- **Common practice**: Leading organizations like Google and Netflix enforce strict flaky test detection and remediation policies.
- **Tooling support**: Popular CI/CD platforms like Jenkins, CircleCI, and GitHub Actions offer plugins for flaky test detection and reporting.
