---
kid: "KID-LANG-GO-CORE-0003"
title: "Testing Norms (go test baseline)"
content_type: "concept"
primary_domain: "["
secondary_domains:
  - "g"
  - "o"
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
  - "g"
  - "o"
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
  - "g"
  - "o"
  - "-"
  - "t"
  - "e"
  - "s"
  - "t"
  - "]"
legacy_path: "PILLARS/LANGUAGES_AND_LIBRARIES/go/language_core/KID-LANG-GO-CORE-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Testing Norms (go test baseline)

# Testing Norms (go test baseline)

## Summary
The "go test baseline" refers to a set of standardized practices and expectations for writing and running tests in Go (Golang) projects. It ensures consistency, reliability, and maintainability of test suites across teams and projects. By adhering to these norms, developers can produce robust code that is easier to debug, extend, and verify.

## When to Use
- When writing unit tests, integration tests, or benchmarks for Go code.
- When establishing a testing framework for a new Go project or team.
- When reviewing code to ensure adherence to best practices in testing.
- When debugging regressions or ensuring backward compatibility in a codebase.
- When automating CI/CD pipelines that include `go test`.

## Do / Don't

### Do
1. **Write Table-Driven Tests**: Use table-driven tests to handle multiple input scenarios in a single test function.
2. **Use `t.Run` for Subtests**: Organize related test cases using `t.Run` for better readability and granularity.
3. **Check Error Values Explicitly**: Always verify error values explicitly in test assertions to avoid false positives.
4. **Use `go test -race`**: Regularly run tests with the race detector to catch concurrency issues.
5. **Keep Tests Isolated**: Ensure tests do not depend on external state or other tests to maintain reliability.

### Don't
1. **Don't Skip Tests Without Justification**: Avoid using `t.Skip` unless there is a documented reason (e.g., platform-specific behavior).
2. **Don't Write Overly Complex Tests**: Avoid tests that are difficult to read or maintain; prioritize clarity.
3. **Don't Ignore Test Coverage**: Avoid neglecting test coverage metrics, especially for critical code paths.
4. **Don't Hardcode Dependencies**: Use mocks or stubs instead of hardcoding external dependencies like databases or APIs.
5. **Don't Overuse Global State**: Avoid relying on global variables or shared state in tests, as it can lead to flakiness.

## Core Content
Testing is a cornerstone of reliable software development, and Go provides a built-in testing package (`testing`) that simplifies the process. The "go test baseline" defines a set of best practices to ensure that tests are efficient, maintainable, and effective.

### Key Principles of the "go test baseline"
1. **Table-Driven Testing**  
   Go encourages table-driven testing, where a single test function iterates over a slice of test cases. This approach reduces duplication and makes it easier to add new test scenarios.  
   Example:  
   ```go
   func TestAdd(t *testing.T) {
       tests := []struct {
           name     string
           a, b     int
           expected int
       }{
           {"positive numbers", 2, 3, 5},
           {"negative numbers", -2, -3, -5},
           {"mixed numbers", -2, 3, 1},
       }

       for _, tt := range tests {
           t.Run(tt.name, func(t *testing.T) {
               result := Add(tt.a, tt.b)
               if result != tt.expected {
                   t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
               }
           })
       }
   }
   ```

2. **Subtests with `t.Run`**  
   Subtests allow you to group related test cases and run them independently. This is particularly useful for scenarios with shared setup but varying inputs.  

3. **Error Handling in Tests**  
   Always check and assert error values explicitly. For example, if a function returns an error, verify that the error is `nil` when expected or matches the desired error type.  
   Example:  
   ```go
   func TestDivide(t *testing.T) {
       _, err := Divide(4, 0)
       if err == nil {
           t.Errorf("expected an error for division by zero, got nil")
       }
   }
   ```

4. **Concurrency Testing**  
   Go's concurrency model requires careful testing to avoid race conditions. Use the `-race` flag to detect data races during testing.  
   Example:  
   ```bash
   go test -race ./...
   ```

5. **Benchmarking**  
   Use Go's built-in benchmarking support to measure performance. Benchmarks should be written in functions starting with `Benchmark` and should use the `b *testing.B` parameter.  
   Example:  
   ```go
   func BenchmarkAdd(b *testing.B) {
       for i := 0; i < b.N; i++ {
           Add(1, 2)
       }
   }
   ```

### Integration with CI/CD  
Automating tests with tools like GitHub Actions, GitLab CI, or Jenkins ensures that the "go test baseline" is consistently applied. Use `go test ./...` as a default command in your pipeline, and include the `-race` and `-cover` flags to detect concurrency issues and measure test coverage.

## Links
- **Go Testing Package Documentation**: Official documentation for the `testing` package in Go.
- **Effective Go**: A guide to writing clear and idiomatic Go code, including testing practices.
- **Go Blog: Writing Table-Driven Tests**: A detailed article on table-driven testing in Go.
- **Go Concurrency Patterns**: A resource for understanding and testing Go's concurrency model.

## Proof / Confidence
The practices outlined in this article are based on Go's official documentation, industry standards, and widely adopted testing norms in the Go community. The use of table-driven tests, subtests, and the race detector is considered best practice and is recommended in resources like "Effective Go" and the Go Blog. Additionally, these practices are validated by their adoption in prominent open-source Go projects like Kubernetes, Docker, and Terraform.
