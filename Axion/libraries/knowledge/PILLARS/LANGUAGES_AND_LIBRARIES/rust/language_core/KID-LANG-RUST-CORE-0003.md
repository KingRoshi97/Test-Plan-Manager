---
kid: "KID-LANG-RUST-CORE-0003"
title: "Testing Norms (cargo test baseline)"
type: concept
pillar: LANGUAGES_AND_LIBRARIES
domains: [rust]
subdomains: []
tags: [rust, testing, cargo-test]
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

# Testing Norms (cargo test baseline)

# Testing Norms (cargo test baseline)

## Summary

In Rust, `cargo test` is the standard tool for running tests within a project. Establishing a "cargo test baseline" means ensuring that all tests pass consistently under defined conditions, serving as a reliable foundation for software quality. This practice helps detect regressions, maintain code correctness, and enforce confidence in changes to the codebase.

## When to Use

- **Continuous Integration (CI):** Use the `cargo test baseline` as a required step in CI pipelines to ensure all tests pass before merging changes.
- **Pre-release Validation:** Run `cargo test` to validate the stability and correctness of a release candidate.
- **Refactoring or Feature Development:** Establish a baseline before making significant changes to ensure no regressions are introduced.
- **Debugging:** Use the baseline to isolate failing tests and identify root causes.
- **Code Reviews:** Require contributors to verify that all tests pass locally before submitting pull requests.

## Do / Don't

### Do:
1. **Run `cargo test` regularly:** Integrate it into your development workflow to catch issues early.
2. **Write meaningful tests:** Ensure your tests cover edge cases, error handling, and expected behavior.
3. **Document prerequisites:** Clearly define the environment and dependencies required to achieve a consistent test baseline.

### Don't:
1. **Ignore failing tests:** Treat failing tests as critical issues to be resolved, not ignored or commented out.
2. **Hardcode test dependencies:** Avoid assumptions about external systems or environments that can lead to flaky tests.
3. **Skip tests in CI:** Never bypass test execution in automated pipelines, as this undermines the reliability of the baseline.

## Core Content

The `cargo test` command is the default testing tool in Rust's ecosystem. It compiles and executes all tests defined in your project, including unit tests, integration tests, and doctests. A "cargo test baseline" refers to a state where all tests pass under predefined conditions, ensuring that the codebase is stable and free of known regressions.

### Why a Baseline Matters

1. **Regression Prevention:** A passing baseline ensures that new changes do not unintentionally break existing functionality.
2. **Code Quality:** It enforces a culture of accountability, where developers are responsible for maintaining correctness.
3. **Collaboration:** A shared baseline allows teams to work on the same codebase without introducing conflicts or instability.
4. **Automation:** A consistent baseline is critical for CI/CD pipelines, enabling automated validation of changes.

### Establishing a Baseline

1. **Define the Environment:** Document the required Rust version, dependencies, and any environment variables. Use tools like `rustup` to manage consistent toolchains.
2. **Run Tests Locally:** Execute `cargo test` locally to verify that all tests pass before committing changes.
3. **Automate in CI:** Configure your CI system (e.g., GitHub Actions, GitLab CI) to run `cargo test` on every pull request and push.
4. **Handle Flaky Tests:** Identify and fix tests that fail intermittently due to timing issues, external dependencies, or non-deterministic behavior.
5. **Monitor Performance:** Use tools like `cargo test -- --nocapture` to debug failing tests and ensure they run efficiently.

### Example

Consider a Rust project with the following test setup:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_addition() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_subtraction() {
        assert_eq!(subtract(5, 3), 2);
    }
}
```

Running `cargo test` produces:

```
running 2 tests
test tests::test_addition ... ok
test tests::test_subtraction ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

A passing result like this forms the baseline. Any future changes to the `add` or `subtract` functions must maintain this state.

## Links

- **Rust Testing Guide:** Official Rust documentation on writing and running tests.
- **Cargo Book:** Comprehensive guide to Cargo, including testing workflows.
- **Continuous Integration with Rust:** Best practices for integrating Rust projects into CI pipelines.
- **Flaky Test Management:** Strategies for identifying and fixing flaky tests.

## Proof / Confidence

The use of `cargo test` as a baseline is a widely adopted industry standard in the Rust ecosystem, supported by Rust's official documentation and community best practices. CI/CD systems like GitHub Actions and GitLab CI commonly include `cargo test` as a default step in Rust pipelines. The reliability of this approach is demonstrated by its adoption in large-scale Rust projects such as Servo and ripgrep.
