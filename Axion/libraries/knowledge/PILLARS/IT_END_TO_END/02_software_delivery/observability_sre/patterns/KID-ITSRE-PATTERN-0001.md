---
kid: "KID-ITSRE-PATTERN-0001"
title: "Structured Logging Pattern (correlation IDs)"
type: pattern
pillar: IT_END_TO_END
domains:
  - software_delivery
  - observability_sre
subdomains: []
tags: [observability, logging, correlation-ids]
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

# Structured Logging Pattern (correlation IDs)

# Structured Logging Pattern (Correlation IDs)

## Summary
The Structured Logging Pattern with correlation IDs enhances observability by embedding structured metadata into log entries, enabling efficient tracing of requests across distributed systems. This approach solves the challenge of debugging and monitoring complex systems by linking related events across services.

## When to Use
- When debugging or monitoring distributed systems, especially microservices architectures.
- When you need to trace requests across multiple services or components.
- When improving observability and troubleshooting in high-throughput systems with asynchronous workflows.
- When compliance or auditing requires detailed traceability of system operations.

## Do / Don't

### Do
- **Use unique correlation IDs**: Generate a unique identifier for every request or transaction at the entry point of your system.
- **Propagate correlation IDs**: Pass the correlation ID across all internal and external service calls.
- **Log with structured metadata**: Include the correlation ID and other relevant metadata (e.g., user ID, request type) in structured log formats like JSON.
- **Validate correlation ID propagation**: Ensure all services in the chain correctly handle and propagate the correlation ID.
- **Use a logging library**: Leverage libraries that support structured logging and correlation ID injection (e.g., Python's `structlog`, Java's `SLF4J MDC`).

### Don't
- **Hardcode correlation ID handling**: Avoid custom implementations when libraries or frameworks provide built-in support.
- **Ignore correlation ID propagation**: Missing propagation breaks the traceability chain, leading to incomplete logs.
- **Use unstructured logging formats**: Avoid plain text logs that make automated parsing and analysis difficult.
- **Overload logs with excessive metadata**: Only include relevant information to avoid bloated logs and performance degradation.
- **Forget to test logging flows**: Ensure correlation IDs are correctly generated, propagated, and logged during integration tests.

## Core Content

### Problem
In distributed systems, tracing the lifecycle of a request across multiple services is challenging. Without a consistent identifier, logs from different services cannot be easily correlated, making debugging and performance analysis time-consuming and error-prone. This is especially problematic in asynchronous systems where requests span multiple queues, databases, and services.

### Solution Approach
The Structured Logging Pattern with correlation IDs solves this by assigning a unique identifier to each request and propagating it downstream. This identifier is logged alongside structured metadata, enabling efficient filtering and correlation of logs.

### Implementation Steps

#### 1. Generate a Correlation ID
- At the system entry point (e.g., API gateway, frontend), generate a unique correlation ID. Use UUIDs or timestamp-based IDs for uniqueness.
- Example (Python):
  ```python
  import uuid
  correlation_id = str(uuid.uuid4())
  ```

#### 2. Propagate the Correlation ID
- Include the correlation ID in headers, context objects, or environment variables as the request flows through services.
- Example (HTTP headers):
  ```
  X-Correlation-ID: <correlation_id>
  ```

#### 3. Log with Structured Metadata
- Use structured logging formats (e.g., JSON) to embed the correlation ID and other metadata in logs.
- Example (Python with `structlog`):
  ```python
  import structlog

  logger = structlog.get_logger()
  logger.info("Processing request", correlation_id=correlation_id, user_id="12345", endpoint="/api/resource")
  ```

#### 4. Verify Propagation
- Ensure all services correctly handle and propagate the correlation ID. Use middleware or interceptors to automate this process.
- Example (Express.js middleware):
  ```javascript
  app.use((req, res, next) => {
    req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || generateCorrelationId();
    next();
  });
  ```

#### 5. Analyze Logs
- Use log aggregation tools (e.g., ELK Stack, Splunk) to filter and correlate logs based on the correlation ID.
- Example query (ElasticSearch):
  ```json
  {
    "query": {
      "match": {
        "correlation_id": "123e4567-e89b-12d3-a456-426614174000"
      }
    }
  }
  ```

### Tradeoffs
- **Performance**: Adding correlation IDs and structured logging introduces slight overhead but is negligible compared to the benefits.
- **Complexity**: Requires consistent implementation across services, which can be challenging in heterogeneous environments.
- **Storage**: Structured logs consume more storage than plain text logs, but this is offset by improved queryability and analysis.

### Alternatives
- **Tracing Systems**: Use distributed tracing tools like OpenTelemetry or Jaeger for more granular insights into request flows.
- **Event-Driven Architectures**: In event-driven systems, consider using event IDs instead of correlation IDs for tracking.

## Links
- **OpenTelemetry Documentation**: Best practices for distributed tracing.
- **JSON Logging Formats**: Guide to structured logging with JSON.
- **SLF4J MDC (Mapped Diagnostic Context)**: Java logging with correlation IDs.
- **ELK Stack for Log Analysis**: How to set up Elasticsearch, Logstash, and Kibana for structured log analysis.

## Proof / Confidence
This pattern is widely adopted in industry standards for observability in distributed systems. Tools like OpenTelemetry, Jaeger, and structured logging libraries (e.g., `structlog`, `SLF4J MDC`) are built around this concept. Benchmarks show that structured logging improves debugging efficiency and reduces mean time to resolution (MTTR) in production environments.
