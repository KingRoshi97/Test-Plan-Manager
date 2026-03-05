---
kid: "KID-ITDIST-PATTERN-0003"
title: "Circuit Breaker Pattern"
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

# Circuit Breaker Pattern

# Circuit Breaker Pattern

## Summary
The Circuit Breaker Pattern is a design pattern used in distributed systems to detect and handle failures gracefully, preventing cascading failures and ensuring system stability. It acts as a safeguard by monitoring service interactions and temporarily halting requests to a failing service until it recovers. This pattern is critical for maintaining resilience in systems with multiple interdependent services.

---

## When to Use
- When a service depends on external systems (e.g., APIs, databases) that may experience downtime, latency spikes, or failures.
- In distributed systems where a failure in one service can cascade and degrade the entire system.
- To prevent resource exhaustion (e.g., thread pools, connection pools) caused by repeated failed requests to an unresponsive service.
- When retrying failed requests without limits could worsen the situation (e.g., overwhelming a slow or recovering service).

---

## Do / Don’t

### Do:
1. **Implement monitoring and metrics**: Track the state of the circuit (open, closed, half-open) and log failures for debugging.
2. **Set reasonable thresholds**: Define thresholds for failure rates or response times to trigger the circuit breaker.
3. **Use fallback mechanisms**: Provide default responses or alternative workflows when the circuit is open.

### Don’t:
1. **Ignore recovery mechanisms**: Always implement a half-open state to test service recovery before resuming normal operations.
2. **Apply indiscriminately**: Avoid using circuit breakers for fast, low-latency, or highly reliable services where failure is rare.
3. **Overlook timeouts**: Failing to set request timeouts can lead to delayed failure detection and resource blocking.

---

## Core Content

### Problem
In distributed systems, services often depend on other services, APIs, or databases. When a dependency fails or becomes unresponsive, repeated requests can overwhelm the failing service, degrade system performance, and lead to cascading failures. Without a mechanism to detect and handle such failures, the entire system can become unstable.

### Solution
The Circuit Breaker Pattern introduces a mechanism to monitor service interactions and stop sending requests to a failing service when failures exceed a predefined threshold. The circuit breaker has three states:
1. **Closed**: Requests flow normally. Failures are monitored.
2. **Open**: Requests are blocked for a specified timeout period after the failure threshold is exceeded.
3. **Half-Open**: A limited number of test requests are allowed to check if the service has recovered.

If the test requests succeed, the circuit transitions back to the **Closed** state. If they fail, it returns to the **Open** state.

### Implementation Steps
1. **Define thresholds**: Set thresholds for failure rates, response times, or both. For example, open the circuit if 50% of requests fail within a 10-second window.
2. **Monitor failures**: Use counters or sliding windows to track request outcomes (success/failure) and response times.
3. **Implement state transitions**:
   - Start in the **Closed** state and monitor failures.
   - Transition to **Open** when thresholds are exceeded. Block requests and return an error or fallback response.
   - After a timeout period, move to **Half-Open** and allow limited test requests.
   - If test requests succeed, transition back to **Closed**. If they fail, return to **Open**.
4. **Provide fallback mechanisms**: Return cached data, default responses, or redirect to a backup service when the circuit is open.
5. **Integrate with monitoring tools**: Track circuit state, failure rates, and recovery attempts to gain visibility into system behavior.
6. **Test extensively**: Simulate failures and recovery scenarios to validate the circuit breaker’s behavior.

### Example (Pseudocode)
```python
class CircuitBreaker:
    def __init__(self, failure_threshold, recovery_timeout):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.state = "CLOSED"
        self.last_failure_time = None

    def call(self, service_call):
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF-OPEN"
            else:
                return "Circuit Open: Fallback Response"

        try:
            response = service_call()
            self.failure_count = 0
            self.state = "CLOSED"
            return response
        except Exception:
            self.failure_count += 1
            if self.failure_count >= self.failure_threshold:
                self.state = "OPEN"
                self.last_failure_time = time.time()
            raise
```

---

## Links
- **Retry Pattern**: A complementary pattern for handling transient failures with controlled retries.
- **Timeouts in Distributed Systems**: Best practices for setting request and connection timeouts.
- **Bulkhead Pattern**: Another resilience pattern to isolate failures and prevent resource exhaustion.
- **Hystrix Documentation**: A popular library for implementing the Circuit Breaker Pattern in Java.

---

## Proof / Confidence
The Circuit Breaker Pattern is widely adopted in distributed systems and is recommended by industry leaders such as Netflix (via Hystrix) and Microsoft (via Polly). It is a foundational concept in designing resilient microservices architectures. Studies and benchmarks consistently show that circuit breakers improve system stability and prevent cascading failures in high-traffic environments.
