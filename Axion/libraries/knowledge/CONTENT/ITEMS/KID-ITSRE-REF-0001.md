---
kid: "KID-ITSRE-REF-0001"
title: "Common Metrics Reference (latency, error rate, saturation)"
content_type: "reference"
primary_domain: "software_delivery"
secondary_domains:
  - "observability_sre"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "o"
  - "b"
  - "s"
  - "e"
  - "r"
  - "v"
  - "a"
  - "b"
  - "i"
  - "l"
  - "i"
  - "t"
  - "y"
  - ","
  - " "
  - "m"
  - "e"
  - "t"
  - "r"
  - "i"
  - "c"
  - "s"
  - ","
  - " "
  - "l"
  - "a"
  - "t"
  - "e"
  - "n"
  - "c"
  - "y"
  - ","
  - " "
  - "e"
  - "r"
  - "r"
  - "o"
  - "r"
  - "-"
  - "r"
  - "a"
  - "t"
  - "e"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/observability_sre/references/KID-ITSRE-REF-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Common Metrics Reference (latency, error rate, saturation)

```markdown
# Common Metrics Reference (latency, error rate, saturation)

## Summary
This reference outlines the definitions, parameters, and usage of three key metrics in software delivery and observability: latency, error rate, and saturation. These metrics are foundational for monitoring system health, diagnosing performance issues, and ensuring reliability in software systems.

## When to Use
- **Latency**: Use to measure system responsiveness and identify delays in processing requests. Ideal for services with strict performance SLAs.
- **Error Rate**: Use to monitor the percentage of failed requests or operations, critical for identifying system reliability issues.
- **Saturation**: Use to assess resource utilization and identify bottlenecks or capacity constraints in your system.

## Do / Don't

### Do
1. **Do** instrument your services to capture latency, error rate, and saturation metrics at key points (e.g., APIs, databases, queues).
2. **Do** set thresholds and alerts based on historical data and SLAs for these metrics.
3. **Do** correlate these metrics with other telemetry data (e.g., logs, traces) to diagnose issues effectively.

### Don't
1. **Don't** rely solely on averages for latency; always consider percentiles (e.g., p95, p99) for a complete picture.
2. **Don't** ignore saturation metrics, even if latency and error rate seem normal — saturation often predicts future issues.
3. **Don't** set static thresholds without considering traffic patterns, resource scaling, or business-critical periods.

## Core Content

### Latency
- **Definition**: The time taken for a request to be processed by the system, measured from initiation to completion.
- **Parameters**:
  - **Average Latency**: Mean response time across all requests.
  - **Percentile Latency**: Response time for a given percentile (e.g., p95, p99).
  - **Tail Latency**: Latency of the slowest requests (e.g., p99.9).
- **Configuration Options**:
  - Use histogram-based monitoring for capturing latency distributions.
  - Set alerts for high percentile latencies (e.g., p95 > SLA threshold).

### Error Rate
- **Definition**: The proportion of requests or operations that fail compared to the total number of requests.
- **Parameters**:
  - **Error Count**: Total number of failed requests.
  - **Error Percentage**: (Error Count / Total Requests) * 100.
- **Configuration Options**:
  - Define what constitutes an error (e.g., HTTP 5xx status codes, timeout exceptions).
  - Set error rate thresholds based on acceptable failure rates (e.g., < 1% for critical services).

### Saturation
- **Definition**: A measure of resource utilization relative to capacity, indicating how "full" a system is.
- **Parameters**:
  - **CPU Utilization**: Percentage of CPU capacity in use.
  - **Memory Utilization**: Percentage of memory capacity in use.
  - **Queue Depth**: Number of requests waiting to be processed.
- **Configuration Options**:
  - Monitor resource metrics (e.g., CPU, memory, disk I/O) with fine granularity.
  - Set alerts for thresholds nearing capacity (e.g., CPU > 85%, memory > 90%).

### Best Practices
- Collect these metrics at regular intervals (e.g., 1-second granularity) for high-resolution insights.
- Visualize metrics using dashboards to identify trends and anomalies.
- Use these metrics to inform scaling decisions, capacity planning, and incident response.

## Links
- **Four Golden Signals in SRE**: A foundational concept for monitoring systems, including latency, error rate, and saturation.
- **Service Level Objectives (SLOs)**: Guidelines for defining and measuring acceptable performance levels.
- **Prometheus Metric Types**: Documentation on collecting and querying latency, error rate, and saturation metrics.
- **Distributed Tracing**: Techniques for correlating latency metrics with traces for root cause analysis.

## Proof / Confidence
This content is based on industry best practices as outlined in Google's SRE Handbook and widely adopted observability frameworks, such as Prometheus and OpenTelemetry. Benchmarks and thresholds are informed by real-world implementations in high-scale systems like those at Netflix, Amazon, and Google.
```
