---
kid: "KID-LANGGO-CHECK-0001"
title: "Go Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "go"
subdomains: []
tags:
  - "go"
  - "checklist"
maturity: "reviewed"
use_policy: "pattern_only"
executor_access: "internal_and_external"
license: "internal_owned"
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Go Production Readiness Checklist

# Go Production Readiness Checklist

## Summary
This checklist ensures that Go applications are production-ready by verifying critical aspects such as performance, reliability, security, and maintainability. It provides actionable steps to identify and resolve potential issues before deployment, minimizing downtime and improving user experience.

## When to Use
- Before deploying a Go application to production for the first time.
- During major updates or refactoring of a Go application.
- When auditing an existing Go application for production stability.
- Prior to scaling a Go application to handle increased traffic or load.

## Do / Don't

### Do
1. **Do implement structured logging**: Use a logging library like `logrus` or `zap` for consistent and readable logs.
2. **Do configure proper timeouts for external calls**: Set timeouts for HTTP clients, database queries, and other external dependencies to prevent blocking operations.
3. **Do use dependency versioning**: Use Go modules (`go.mod`) to lock dependency versions and avoid unexpected changes.
4. **Do perform load testing**: Simulate production-like traffic using tools like `k6` or `locust` to identify bottlenecks.
5. **Do enable runtime profiling**: Use `pprof` to monitor memory, CPU, and goroutine usage in production.

### Don't
1. **Don't use hard-coded secrets**: Store credentials in a secure vault like HashiCorp Vault or AWS Secrets Manager.
2. **Don't ignore error handling**: Always check and handle errors from functions and external calls.
3. **Don't use global variables for shared state**: Use dependency injection or context to manage shared resources safely.
4. **Don't deploy without health checks**: Ensure your application has `/health` endpoints for liveness and readiness probes.
5. **Don't rely on default configurations**: Explicitly configure settings for databases, servers, and libraries to match production needs.

## Core Content

### Code Quality
- **Static Analysis**: Use tools like `golangci-lint` to identify code smells, unused variables, and potential bugs.
- **Unit Tests**: Ensure comprehensive test coverage for critical business logic. Use `testing` and frameworks like `testify`.
- **Race Detection**: Run tests with the `-race` flag to detect data races in concurrent code.

### Performance and Scalability
- **Concurrency Management**: Ensure goroutines are properly managed and avoid leaks. Use tools like `goleak` for detection.
- **Connection Pooling**: Use connection pooling libraries for databases (e.g., `sql.DB`) to optimize resource usage.
- **Caching**: Implement caching for frequently accessed data using `redis` or `memcached`.

### Security
- **Input Validation**: Sanitize and validate all user inputs to prevent injection attacks.
- **TLS Configuration**: Enforce HTTPS and configure TLS settings properly. Use libraries like `crypto/tls`.
- **Dependency Audit**: Regularly audit third-party libraries for vulnerabilities using tools like `snyk` or `go list -m all`.

### Observability
- **Metrics Collection**: Integrate monitoring tools like Prometheus to collect application metrics.
- **Distributed Tracing**: Use OpenTelemetry or Jaeger to trace requests across services.
- **Alerting**: Set up alerts for critical metrics such as latency, error rates, and resource utilization.

### Deployment
- **Containerization**: Use Docker to containerize your application and define resource limits.
- **CI/CD Pipeline**: Automate builds, tests, and deployments using tools like GitHub Actions or Jenkins.
- **Rollback Strategy**: Implement a rollback mechanism for failed deployments.

### Documentation
- **README and API Docs**: Maintain clear documentation for developers, including setup instructions and API references.
- **Runbooks**: Create runbooks for common operational tasks like restarting services or scaling resources.

## Links
1. [Go Modules](https://golang.org/doc/go1.11#modules) - Official documentation on dependency management.
2. [Go Profiling with pprof](https://golang.org/pkg/net/http/pprof/) - Guide to runtime profiling in Go.
3. [Prometheus Go Client](https://prometheus.io/docs/guides/go-client/) - How to instrument Go applications with Prometheus.
4. [Golangci-lint](https://golangci-lint.run/) - Tool for static analysis and linting in Go.

## Proof / Confidence
- **Industry Standards**: Tools like Prometheus, OpenTelemetry, and Docker are widely adopted in production environments.
- **Benchmarks**: Go's built-in profiling tools (`pprof`) and race detector (`-race`) are standard practices for performance and concurrency validation.
- **Common Practice**: Structured logging, health checks, and CI/CD pipelines are foundational elements of modern production systems.
