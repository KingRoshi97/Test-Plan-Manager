---
kid: "KID-ITDIST-PITFALL-0002"
title: "Retry storms and thundering herds"
type: pitfall
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

# Retry storms and thundering herds

# Retry Storms and Thundering Herds

## Summary

Retry storms and thundering herds are common pitfalls in distributed systems that occur when multiple clients or services overwhelm a shared resource with simultaneous or repeated requests. These issues often arise during system failures, degraded performance, or high-traffic scenarios, and can lead to cascading failures, degraded user experience, and prolonged outages. Proper design and mitigation strategies are essential to prevent these problems.

---

## When to Use

This knowledge applies to the following scenarios:
- Distributed systems with multiple clients or services interacting with a shared resource (e.g., databases, APIs, or caches).
- Systems where retries are implemented for fault tolerance, such as in microservices or client-server architectures.
- High-traffic systems or systems prone to sudden spikes in load, such as during flash sales or major events.
- Scenarios involving failure recovery, such as when a service or resource becomes temporarily unavailable.

---

## Do / Don't

### Do:
1. **Implement exponential backoff with jitter**: Use retry strategies that spread out retry attempts over time to avoid synchronized requests.
2. **Use circuit breakers**: Prevent overloading a failing or degraded resource by temporarily halting retries and allowing the system to recover.
3. **Monitor and alert on retry patterns**: Track retry rates and patterns to detect potential retry storms or thundering herds early.

### Don't:
1. **Retry immediately without delay**: Avoid retrying failed requests immediately, as this can amplify the load on an already stressed resource.
2. **Assume retries are harmless**: Excessive retries can exacerbate system failures and lead to cascading issues.
3. **Ignore resource capacity limits**: Design systems with the assumption that resources have finite capacity and can be overwhelmed.

---

## Core Content

### The Problem
Retry storms occur when multiple clients or services repeatedly retry failed requests in a short time frame, overwhelming the target resource. Thundering herds, on the other hand, happen when many clients simultaneously send requests to a resource, often after it becomes available following downtime. Both issues can lead to resource exhaustion, degraded performance, and cascading failures across the system.

These pitfalls often arise due to well-intentioned but poorly designed retry mechanisms. For example, developers may configure retries with fixed intervals or without considering the cumulative impact of retries across clients. Similarly, systems may lack safeguards to handle sudden spikes in traffic when a resource becomes available.

### Why It Happens
- **Retry Logic Misconfiguration**: Fixed-interval retries or aggressive retry policies can cause synchronized retry attempts.
- **Lack of Backoff or Jitter**: Without mechanisms to stagger retries, clients retry at the same time, amplifying the load.
- **Uncoordinated Clients**: In distributed systems, independent clients may not be aware of each other's behavior, leading to unintentional synchronization.
- **Resource Recovery Events**: When a resource becomes available after downtime, all queued or delayed requests may flood the resource simultaneously.

### Consequences
- **Resource Overload**: The target resource (e.g., a database or API) may become overwhelmed, leading to slower response times or complete unavailability.
- **Cascading Failures**: Overloaded resources can cause failures in dependent systems, propagating the issue throughout the architecture.
- **Prolonged Outages**: Retry storms and thundering herds can delay recovery by preventing the resource from stabilizing.

### Detection
- **Spikes in Request Rates**: Monitor for sudden increases in requests to a specific resource, especially during failure or recovery events.
- **Increased Latency or Errors**: Look for patterns of rising latency or error rates that coincide with retry attempts.
- **Retry Patterns**: Analyze logs for repetitive retry attempts from multiple clients.

### Mitigation and Prevention
1. **Exponential Backoff with Jitter**: Implement retry policies that increase the delay between retries exponentially and add randomness (jitter) to avoid synchronization.
2. **Circuit Breakers**: Use circuit breakers to temporarily block retries to a failing resource, giving it time to recover.
3. **Rate Limiting**: Enforce rate limits to prevent individual clients from overwhelming the resource.
4. **Token Buckets or Leaky Buckets**: Use these algorithms to smooth out traffic and prevent sudden spikes.
5. **Staggered Recovery**: Design systems to stagger client reconnections or retries after a resource becomes available, avoiding a thundering herd.
6. **Load Testing and Capacity Planning**: Regularly test the system under high load and ensure resources can handle expected peak traffic.

### Real-World Scenario
Consider an e-commerce platform during a flash sale. A database outage temporarily prevents order placement. Once the database recovers, thousands of clients retry their failed requests simultaneously. This thundering herd overwhelms the database, causing high latency and new errors. The outage is prolonged as retries continue to flood the system.

By implementing exponential backoff with jitter, the platform could have distributed retries over time, reducing the load on the database. A circuit breaker could have temporarily halted retries until the database stabilized, allowing for a smoother recovery.

---

## Links
- **Exponential Backoff and Jitter**: Learn about retry strategies that reduce synchronized retries in distributed systems.
- **Circuit Breaker Pattern**: Explore how circuit breakers can prevent cascading failures in microservices architectures.
- **Rate Limiting Techniques**: Understand how to control traffic to protect shared resources.
- **Distributed Systems Design Principles**: Best practices for designing resilient and fault-tolerant distributed systems.

---

## Proof / Confidence

This content is based on widely recognized industry practices and patterns in distributed systems design, including the **Retry Pattern** and **Circuit Breaker Pattern** from Martin Fowler's catalog of enterprise integration patterns. Exponential backoff with jitter is a standard recommendation in cloud computing platforms like AWS, Google Cloud, and Azure to prevent retry storms. Real-world incidents, such as the 2012 AWS outage caused by a thundering herd, highlight the critical importance of addressing these pitfalls.
