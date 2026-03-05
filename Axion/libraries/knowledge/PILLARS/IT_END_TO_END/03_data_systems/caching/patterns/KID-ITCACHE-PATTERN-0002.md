---
kid: "KID-ITCACHE-PATTERN-0002"
title: "Request Coalescing Pattern"
type: pattern
pillar: IT_END_TO_END
domains:
  - data_systems
  - caching
subdomains: []
tags:
  - caching
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

# Request Coalescing Pattern

# Request Coalescing Pattern

## Summary
The Request Coalescing Pattern is a caching optimization technique that consolidates multiple identical requests for the same resource into a single backend call. It reduces redundant processing, minimizes load on backend systems, and improves overall system performance, especially under high concurrency scenarios.

## When to Use
- When multiple clients or threads frequently request the same resource simultaneously.
- In high-traffic systems where backend calls are expensive (e.g., database queries or API calls).
- When the resource being requested has a predictable or short-lived cache expiration policy.
- In systems prone to thundering herd problems during cache misses.

## Do / Don't

### Do
- **Do implement request coalescing in caching layers** to reduce backend load during cache misses.
- **Do use locking or synchronization mechanisms** to prevent race conditions when handling concurrent requests.
- **Do monitor request patterns** to identify high-frequency resources that benefit from coalescing.
- **Do set appropriate timeouts** for coalesced requests to avoid blocking other operations indefinitely.
- **Do test under high concurrency scenarios** to ensure the implementation scales effectively.

### Don't
- **Don't use request coalescing for resources with highly dynamic or user-specific data** where requests are unlikely to overlap.
- **Don't coalesce requests without a fallback mechanism** in case the backend call fails.
- **Don't ignore the cost of locking mechanisms**; excessive contention can degrade performance.
- **Don't apply request coalescing indiscriminately**; analyze whether the resource access pattern justifies the complexity.
- **Don't neglect logging and monitoring**; visibility into coalesced requests is essential for debugging and performance tuning.

## Core Content

### Problem
In high-concurrency systems, multiple clients or threads often request the same resource simultaneously. Without optimization, each request triggers separate backend calls, leading to redundant processing, increased latency, and higher resource utilization. This is particularly problematic during cache misses or when backend systems are under heavy load.

### Solution
The Request Coalescing Pattern consolidates identical concurrent requests for the same resource into a single backend call. Subsequent requests are queued or blocked until the backend response is retrieved, after which the result is shared across all waiting requests. This reduces redundant processing and improves system efficiency.

### Implementation Steps

#### 1. Identify Coalescing Opportunities
Analyze request patterns to identify resources frequently requested in parallel. These are typically static or semi-static resources, such as configuration files, shared data, or public API responses.

#### 2. Implement a Request Queue
Create a mechanism to queue requests for the same resource. For example, use a hash map where the key is the resource identifier and the value is a promise or future representing the pending backend call.

#### 3. Use Synchronization
Employ locking or synchronization primitives (e.g., mutexes or semaphores) to ensure only one backend call is made for a given resource at any time. For example:
```python
import threading

lock = threading.Lock()
cache = {}

def fetch_resource(resource_id):
    with lock:
        if resource_id in cache:
            return cache[resource_id]
        # Make backend call
        result = backend_call(resource_id)
        cache[resource_id] = result
        return result
```

#### 4. Handle Cache Misses
If the resource is not in the cache, initiate the backend call while blocking or queuing subsequent requests for the same resource. Once the backend response is available, unblock the queued requests and return the result.

#### 5. Set Timeouts and Fallbacks
Ensure coalesced requests have timeouts to prevent indefinite blocking. Implement fallback mechanisms to handle backend call failures gracefully.

#### 6. Monitor and Optimize
Log coalesced requests and monitor their performance. Use metrics to refine the implementation, such as reducing lock contention or optimizing cache expiration policies.

### Tradeoffs
- **Pros**: Reduces backend load, minimizes redundant processing, and improves latency for identical requests.
- **Cons**: Adds complexity to the caching layer, requires careful synchronization, and may introduce contention under heavy load.

### Alternatives
- **Batching**: Combine multiple requests into a single backend call, but this requires backend support for batch processing.
- **Preemptive Caching**: Cache frequently requested resources proactively to avoid cache misses altogether.
- **Rate Limiting**: Limit the frequency of backend calls rather than coalescing requests.

## Links
- **Caching Strategies for High-Performance Systems**: Overview of caching techniques and their tradeoffs.
- **Thundering Herd Problem**: Explanation of the problem and mitigation strategies.
- **Mutex and Semaphore Basics**: Guide to synchronization primitives for concurrent programming.
- **Cache Expiration Policies**: Best practices for managing cache lifetimes.

## Proof / Confidence
The Request Coalescing Pattern is widely adopted in high-performance systems, including CDN providers, database query optimizers, and distributed caching solutions. Industry benchmarks demonstrate significant reductions in backend load and latency when coalescing is implemented. Common practices, such as request deduplication in Redis or NGINX caching, validate its effectiveness in real-world applications.
