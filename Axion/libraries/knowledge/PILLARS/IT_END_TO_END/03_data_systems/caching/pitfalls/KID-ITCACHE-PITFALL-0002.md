---
kid: "KID-ITCACHE-PITFALL-0002"
title: "Cache stampede"
type: pitfall
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

# Cache stampede

# Cache Stampede

## Summary
A cache stampede occurs when multiple requests simultaneously attempt to regenerate an expired or missing cache entry, overwhelming the backend system. This pitfall is common in high-traffic applications and can lead to degraded performance, downtime, or even cascading failures. Proper mitigation strategies are essential to ensure system stability and scalability.

---

## When to Use
This warning applies to systems that:
- Rely heavily on caching for performance optimization.
- Experience high traffic or concurrent requests for the same resource.
- Use time-based cache expiration policies without safeguards for regeneration.
- Handle expensive computations or database queries that are cached to reduce load.

---

## Do / Don't

### Do:
1. **Implement Cache Regeneration Strategies:** Use techniques like cache locking, token-based regeneration, or stale-while-revalidate to prevent simultaneous cache rebuilds.
2. **Monitor Cache Expiry Patterns:** Track cache hit/miss rates and expiration times to identify potential stampede risks.
3. **Use Backoff Mechanisms:** Introduce exponential backoff or jitter for retrying failed requests to reduce simultaneous load on the backend.

### Don't:
1. **Allow Uncontrolled Expiry:** Avoid setting cache expiration times without considering the impact of simultaneous misses.
2. **Ignore Traffic Spikes:** Do not assume consistent traffic patterns; high traffic surges can exacerbate stampede risks.
3. **Rely Solely on Default Cache Settings:** Default caching configurations may not account for stampede scenarios; always customize settings for your workload.

---

## Core Content

### The Mistake
A cache stampede happens when a cached resource expires or is missing, and multiple concurrent requests attempt to regenerate it at the same time. This often occurs in systems with high traffic and time-based cache expiration policies. For example, if a cache entry for a popular resource expires, hundreds or thousands of requests may simultaneously hit the backend to regenerate the cache. Without safeguards, this can overwhelm the backend, leading to performance degradation or outages.

### Why People Make It
1. **Misconfigured Cache Policies:** Developers may set short expiration times to ensure fresh data but fail to account for the regeneration load.
2. **Assumption of Uniform Traffic:** Teams often underestimate the impact of traffic bursts or concurrent requests for the same resource.
3. **Lack of Awareness:** Cache stampedes are less intuitive than other performance issues, leading to oversight during system design.

### Consequences
1. **Backend Overload:** Simultaneous cache regeneration requests can overwhelm databases, APIs, or computation layers.
2. **System Downtime:** High load can cause cascading failures, leading to outages or degraded service.
3. **Increased Latency:** Users experience slower responses due to backend bottlenecks.
4. **Resource Wastage:** Redundant regeneration of the same cache entry wastes CPU, memory, and network bandwidth.

### How to Detect It
1. **Spike in Backend Load:** Monitor backend systems for sudden increases in CPU, memory, or database query rates during cache expiration events.
2. **Cache Miss Patterns:** Track cache hit/miss rates and identify periods of unusually high misses.
3. **Monitoring Tools:** Use distributed tracing and logging to identify simultaneous requests for the same resource.

### How to Fix or Avoid It
1. **Cache Locking:** Implement a locking mechanism where only one request regenerates the cache while others wait or use stale data. For example, use a distributed lock with tools like Redis or Memcached.
2. **Stale-While-Revalidate:** Serve stale data to users while regenerating the cache in the background. This reduces the load on the backend during regeneration.
3. **Randomized Expiry Times:** Add jitter to cache expiration times to prevent synchronized expiration of multiple entries.
4. **Request Deduplication:** Deduplicate concurrent requests for the same resource by funneling them into a single regeneration process.
5. **Rate Limiting:** Introduce rate limiting for cache regeneration requests to prevent backend overload.

### Real-World Scenario
Consider an e-commerce website with a product catalog cached for performance. If the cache entry for a popular product expires during a flash sale, thousands of users may simultaneously request the product page. Without safeguards, the backend database is overwhelmed with queries, leading to slow responses and potential downtime. By implementing cache locking and stale-while-revalidate, the system can serve stale data temporarily while regenerating the cache entry in the background, ensuring smooth operation during high traffic.

---

## Links
- **Cache Locking Techniques:** Explore distributed locking mechanisms in Redis and Memcached.
- **Stale-While-Revalidate Pattern:** Learn about serving stale cache data while regenerating in the background.
- **Caching Best Practices:** Review industry standards for designing scalable caching systems.
- **Distributed Systems Design:** Understand how to handle concurrency and synchronization in high-traffic systems.

---

## Proof / Confidence
The risk of cache stampedes is well-documented in distributed systems literature and industry best practices. Tools like Redis and Memcached provide built-in mechanisms for cache locking and expiration jitter to address this issue. Case studies from high-traffic platforms like Twitter and e-commerce sites highlight the importance of mitigation strategies. Benchmarks show that implementing stale-while-revalidate and locking can reduce backend load by up to 80% during cache expiration events.
