---
kid: "KID-ITDIST-PATTERN-0002"
title: "Retry with Backoff Pattern"
type: pattern
pillar: IT_END_TO_END
domains:
  - data_systems
  - distributed_systems
subdomains: []
tags:
  - distributed_systems
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

# Retry with Backoff Pattern

# Retry with Backoff Pattern

## Summary

The Retry with Backoff Pattern is a technique used in distributed systems to handle transient failures by retrying failed operations with increasing delays between retries. This approach improves system resilience, reduces the risk of overwhelming dependent services, and ensures better resource utilization in scenarios where failures are temporary.

## When to Use

- **Transient Failures**: When operations fail due to temporary issues like network instability, service throttling, or intermittent outages.
- **Rate Limits**: When interacting with APIs or services that enforce rate limits, retrying with backoff prevents immediate retries from breaching limits.
- **Distributed Systems**: When systems rely on external dependencies (e.g., microservices, databases, or third-party APIs) prone to occasional failures.
- **Avoiding Cascading Failures**: To prevent retries from amplifying failures across dependent services during partial outages.

## Do / Don't

### Do
1. **Implement Exponential Backoff**: Gradually increase the delay between retries (e.g., 1s, 2s, 4s) to reduce load on dependent systems.
2. **Set a Maximum Retry Limit**: Define a cap on the number of retries to avoid infinite loops and wasted resources.
3. **Use Jitter**: Add randomness to backoff intervals to prevent synchronized retries across multiple clients.
4. **Log Retry Attempts**: Ensure retries are logged for debugging and monitoring purposes.
5. **Handle Idempotency**: Ensure the retried operation is idempotent to avoid unintended side effects.

### Don't
1. **Retry Immediately**: Avoid retrying without delay, as it increases the risk of overwhelming the system.
2. **Ignore Failure Context**: Don’t retry blindly; check for error codes or conditions indicating permanent failures (e.g., 404 Not Found).
3. **Retry Indefinitely**: Avoid infinite retries; this can lead to resource exhaustion and degraded system performance.
4. **Use Fixed Delays**: Avoid constant retry intervals, as they can cause contention when multiple clients retry simultaneously.
5. **Neglect Monitoring**: Don’t deploy retries without monitoring their impact on system health and performance.

## Core Content

### Problem
In distributed systems, transient failures are common due to network issues, overloaded services, or temporary outages. Without a retry mechanism, operations may fail prematurely, leading to degraded user experience. However, naive retries (e.g., immediate or constant retries) can exacerbate problems by overwhelming the system or creating contention.

### Solution
The Retry with Backoff Pattern addresses transient failures by retrying failed operations with increasing delays between attempts. This reduces the load on dependent systems and increases the likelihood of successful execution as conditions stabilize.

### Implementation Steps
1. **Define Retry Logic**:
   - Identify operations prone to transient failures (e.g., API calls, database queries).
   - Determine failure conditions that warrant retries (e.g., HTTP 500, network timeouts).

2. **Implement Exponential Backoff**:
   - Use a formula like `delay = baseDelay * (2^attempt)` where `baseDelay` is the initial delay (e.g., 100ms).
   - Cap the delay at a maximum value (e.g., 10 seconds) to avoid excessively long waits.

3. **Add Jitter**:
   - Introduce randomness to backoff intervals: `delay = delay * (1 + randomFactor)` where `randomFactor` is a small percentage (e.g., 0.1).
   - This prevents synchronized retries when multiple clients experience failures simultaneously.

4. **Set Retry Limits**:
   - Define a maximum number of retries (e.g., 5 attempts).
   - Optionally, implement a total timeout for the operation (e.g., 30 seconds).

5. **Handle Idempotency**:
   - Ensure the operation can be retried safely without causing duplicate effects (e.g., avoid double-charging customers).

6. **Monitor and Log**:
   - Log each retry attempt with relevant metadata (e.g., timestamp, error code, delay).
   - Monitor retry patterns to identify systemic issues (e.g., frequent failures due to service throttling).

### Example Code (Python)
```python
import time
import random

def retry_with_backoff(operation, max_retries=5, base_delay=0.1, max_delay=10):
    for attempt in range(max_retries):
        try:
            return operation()
        except Exception as e:
            if attempt == max_retries - 1:
                raise e  # Exhausted retries
            delay = min(base_delay * (2 ** attempt), max_delay)
            delay += random.uniform(0, delay * 0.1)  # Add jitter
            time.sleep(delay)
            print(f"Retrying after {delay:.2f}s due to: {e}")

# Example usage
def flaky_operation():
    if random.random() < 0.7:  # Simulate transient failure
        raise Exception("Transient error")
    return "Success"

result = retry_with_backoff(flaky_operation)
print(result)
```

### Tradeoffs
- **Pros**:
  - Improves resilience in distributed systems.
  - Reduces the risk of overwhelming dependent services.
  - Handles transient failures effectively.
- **Cons**:
  - Increased latency for successful operations.
  - Complexity in implementation and testing.
  - May not address permanent failures or systemic issues.

### Alternatives
- **Circuit Breaker Pattern**: Use when failures are frequent and retries are unlikely to succeed. This prevents repeated calls to failing systems.
- **Fail-Fast Approach**: Use when immediate feedback is preferred over retries (e.g., user-facing applications with strict latency requirements).

## Links
- **Circuit Breaker Pattern**: A complementary pattern to prevent retries during prolonged failures.
- **Idempotency in Distributed Systems**: Best practices for designing idempotent operations.
- **HTTP Retry-After Header**: Standard for communicating retry intervals in HTTP responses.
- **AWS SDK Retry Policy**: Example of retry with backoff in cloud SDKs.

## Proof / Confidence

This pattern is widely adopted in distributed systems and cloud platforms. Industry standards like the **AWS SDK**, **Google Cloud Client Libraries**, and **Microsoft Azure SDKs** implement retry with backoff to handle transient failures. Benchmarks show exponential backoff with jitter reduces contention and improves success rates in high-load scenarios.
