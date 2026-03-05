---
kid: "KID-LANG-GO-WEB-0002"
title: "Middleware + Logging Pattern"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [go]
subdomains: []
tags: [go, middleware, logging]
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

# Middleware + Logging Pattern

# Middleware + Logging Pattern

## Summary
The Middleware + Logging Pattern is a structured approach for implementing centralized logging in Go applications. By integrating logging into middleware, you ensure consistent, contextual, and efficient log generation for HTTP requests and responses. This pattern simplifies debugging, improves observability, and reduces repetitive logging code scattered across your application.

## When to Use
- When building web applications or APIs in Go that rely on middleware for handling HTTP requests and responses.
- When you need centralized, consistent, and contextual logging for debugging, monitoring, or compliance purposes.
- When you want to avoid duplicating logging logic across multiple handlers or services.
- When your application requires detailed logs for performance analysis, error tracking, or auditing.

## Do / Don't
### Do
- **Do** use this pattern for web applications using frameworks like `net/http`, `chi`, or `gorilla/mux`.
- **Do** include request-specific metadata (e.g., request ID, method, URL, headers) in your logs.
- **Do** use structured logging libraries like `logrus`, `zap`, or `zerolog` for better log parsing and searchability.
- **Do** ensure middleware is lightweight and does not introduce significant latency.
- **Do** log errors and unexpected behaviors with appropriate severity levels (e.g., `INFO`, `WARN`, `ERROR`).

### Don't
- **Don't** log sensitive information like passwords, tokens, or PII unless properly masked or encrypted.
- **Don't** use print-based logging (`fmt.Println`) in production; prefer structured logging libraries.
- **Don't** log excessively in high-throughput applications, as it can degrade performance.
- **Don't** assume all logs are needed; use log levels to control verbosity.
- **Don't** hardcode log destinations; use configuration to direct logs to files, stdout, or external systems like ELK or Datadog.

## Core Content
### Problem
Logging is essential for debugging, monitoring, and auditing applications. Without a centralized approach, logging can become inconsistent, repetitive, and difficult to manage. Scattered logging code across handlers and services increases maintenance overhead and makes it harder to enforce best practices.

### Solution
Integrate logging into middleware to ensure consistent and contextual logging for every HTTP request and response. Middleware acts as a centralized layer, intercepting requests and responses to log relevant information. This approach reduces code duplication, improves observability, and ensures logs are structured and meaningful.

### Implementation Steps
1. **Choose a Structured Logging Library**
   Select a logging library like `logrus`, `zap`, or `zerolog` for structured logging. These libraries support JSON output, log levels, and performance optimizations.

2. **Create a Logging Middleware**
   Implement middleware that wraps HTTP handlers. The middleware should:
   - Log incoming requests with metadata such as method, URL, headers, and request ID.
   - Log outgoing responses with status codes, response times, and error messages (if any).

3. **Add Contextual Information**
   Use context to pass metadata (e.g., request ID) through the middleware chain. This ensures logs are traceable and tied to specific requests.

4. **Integrate Middleware in the Application**
   Register the logging middleware in your router or HTTP server to ensure all requests pass through it.

5. **Control Log Levels**
   Use log levels (`DEBUG`, `INFO`, `ERROR`) to control verbosity and avoid excessive logging in production.

### Example Code
```go
package main

import (
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

func loggingMiddleware(logger *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			requestID := uuid.New().String()

			// Add request ID to context
			ctx := r.Context()
			ctx = context.WithValue(ctx, "requestID", requestID)
			r = r.WithContext(ctx)

			// Log incoming request
			logger.Info("Incoming request",
				zap.String("requestID", requestID),
				zap.String("method", r.Method),
				zap.String("url", r.URL.String()),
				zap.String("remoteAddr", r.RemoteAddr),
			)

			// Call the next handler
			next.ServeHTTP(w, r)

			// Log response details
			duration := time.Since(start)
			logger.Info("Request completed",
				zap.String("requestID", requestID),
				zap.Duration("duration", duration),
			)
		})
	}
}

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, world!"))
	})

	http.ListenAndServe(":8080", loggingMiddleware(logger)(mux))
}
```

### Tradeoffs
- **Performance Overhead**: Logging middleware introduces additional processing for each request, which may impact performance in high-throughput systems.
- **Log Volume**: Centralized logging can generate large volumes of logs, increasing storage and processing costs.
- **Complexity**: Adding structured logging and context propagation may increase implementation complexity.

### Alternatives
- Use a dedicated logging library without middleware if you only need ad-hoc logging in specific handlers.
- For very high-performance systems, consider sampling logs or using an observability tool like OpenTelemetry instead of detailed request/response logging.

## Links
- **Structured Logging in Go**: Best practices for structured logging in Go applications.
- **Go Middleware Patterns**: Common middleware patterns for Go web applications.
- **Zap Logging Library**: Documentation for the `zap` structured logging library.
- **OpenTelemetry for Go**: Distributed tracing and observability for Go applications.

## Proof / Confidence
This pattern is widely used in Go web applications and aligns with industry best practices for observability. Structured logging libraries like `zap` and `logrus` are commonly recommended in the Go community. Centralized logging via middleware is a standard approach in frameworks like `gin`, `chi`, and `gorilla/mux`.
