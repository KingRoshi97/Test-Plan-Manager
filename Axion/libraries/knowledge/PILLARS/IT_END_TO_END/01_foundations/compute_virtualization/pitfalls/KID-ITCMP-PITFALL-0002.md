---
kid: "KID-ITCMP-PITFALL-0002"
title: "Missing Resource Limits — Noisy Neighbor"
type: "pitfall"
pillar: "IT_END_TO_END"
domains:
  - "compute_virtualization"
subdomains: []
tags:
  - "compute_virtualization"
  - "pitfall"
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

# Missing Resource Limits — Noisy Neighbor

# Missing Resource Limits — Noisy Neighbor

## Summary
A common pitfall in compute virtualization is failing to set resource limits on virtualized workloads, leading to the "noisy neighbor" problem. This occurs when one workload consumes excessive resources, degrading the performance of other workloads on the same host. Proper configuration of resource limits is essential to ensure predictable performance and avoid service disruptions.

## When to Use
This pitfall applies to scenarios where multiple virtual machines (VMs), containers, or workloads share the same physical host. It is especially relevant for:
- Multi-tenant environments (e.g., cloud platforms, shared hosting).
- High-density virtualization setups where resource contention is likely.
- Applications requiring consistent performance guarantees, such as databases or real-time systems.

## Do / Don't

### Do:
1. **Set resource limits** (CPU, memory, I/O) for all workloads during deployment.
2. **Monitor resource usage** using tools like Prometheus, Grafana, or native hypervisor metrics.
3. **Test workloads under stress** to identify potential noisy neighbor scenarios before production.

### Don't:
1. **Assume workloads will self-regulate** resource consumption without explicit limits.
2. **Overcommit resources** without proper safeguards, such as burst limits or quotas.
3. **Ignore warning signs** like increased latency or degraded performance in shared environments.

## Core Content
### The Mistake
The "noisy neighbor" problem arises when resource limits are not applied to virtualized workloads. Without limits, one workload can monopolize shared resources (CPU, memory, disk I/O, or network bandwidth), starving other workloads on the same host. This is often overlooked during initial deployment due to assumptions about workload behavior or a lack of awareness of resource contention risks.

### Why People Make It
1. **Default configurations**: Many virtualization platforms (e.g., Kubernetes, VMware, Docker) do not enforce strict resource limits by default.
2. **Performance optimization**: Administrators may avoid limits to allow workloads to scale dynamically, assuming this will optimize resource utilization.
3. **Lack of monitoring**: Teams may not have visibility into resource usage patterns, leading to undetected contention.

### Consequences
1. **Performance degradation**: Critical workloads may experience increased latency, timeouts, or crashes due to resource starvation.
2. **Service disruptions**: Shared environments may become unstable, impacting multiple tenants or applications.
3. **Operational inefficiency**: Diagnosing noisy neighbor issues can be time-consuming and may require redeployment or reconfiguration of workloads.

### How to Detect It
1. **Monitor host metrics**: Use tools like Prometheus or native hypervisor dashboards to identify resource contention. Look for spikes in CPU, memory, or I/O usage.
2. **Analyze workload performance**: Sudden drops in performance or increased error rates may indicate resource starvation caused by a noisy neighbor.
3. **Review logs**: Check application and system logs for resource-related warnings or errors.

### How to Fix or Avoid It
1. **Set resource limits**: Define CPU, memory, and I/O limits for each workload. For example, in Kubernetes, use `requests` and `limits` in pod specifications to enforce resource boundaries.
2. **Use quotas**: Apply quotas at the tenant or namespace level to prevent excessive resource consumption.
3. **Implement Quality of Service (QoS)**: Use QoS classes in Kubernetes or similar features in other platforms to prioritize critical workloads.
4. **Enable burst limits**: Configure burstable resource limits to allow temporary spikes while maintaining overall control.
5. **Conduct stress testing**: Simulate high-load scenarios to identify potential noisy neighbor issues before production deployment.

### Real-World Scenario
Consider a multi-tenant Kubernetes cluster hosting several applications, including a real-time analytics service and a batch processing job. If the batch processing job is deployed without resource limits, it may consume all available CPU and memory during peak load, causing the analytics service to experience latency spikes and missed deadlines. Setting appropriate resource limits on the batch job ensures that the analytics service maintains consistent performance, even during high-demand periods.

## Links
1. **Kubernetes Resource Management**: Best practices for setting resource requests and limits in Kubernetes.
2. **VMware Resource Pools**: Guidelines for configuring resource pools to manage VM resource allocation.
3. **Noisy Neighbor Detection**: Techniques for identifying and mitigating noisy neighbor issues in virtualized environments.
4. **Quality of Service in Virtualization**: Overview of QoS features in popular virtualization platforms.

## Proof / Confidence
This content is supported by industry standards and best practices:
- Kubernetes documentation recommends defining resource limits to prevent resource contention.
- VMware and other hypervisor vendors provide resource pool configuration options to address noisy neighbor issues.
- Benchmarks from multi-tenant environments consistently highlight the importance of resource isolation to ensure predictable performance.
