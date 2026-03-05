---
kid: "KID-ITCMP-CONCEPT-0003"
title: "Scheduling Basics (why pods move)"
type: "concept"
pillar: "IT_END_TO_END"
domains:
  - "compute_virtualization"
subdomains: []
tags:
  - "compute_virtualization"
  - "concept"
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

# Scheduling Basics (why pods move)

# Scheduling Basics (Why Pods Move)

## Summary
In containerized environments, such as Kubernetes, scheduling determines where workloads (pods) run within a cluster. Pods may move between nodes for reasons like resource optimization, node failures, or policy changes. Understanding why pods move is essential for maintaining application performance, availability, and cost efficiency in virtualized compute environments.

## When to Use
- When troubleshooting unexpected pod rescheduling or evictions.
- When designing applications to handle disruptions caused by pod movement.
- When optimizing cluster resource usage and cost efficiency.
- When implementing high availability or fault-tolerant systems.
- When scaling applications dynamically based on workload demands.

## Do / Don't

### Do:
1. **Design stateless applications** to minimize disruption when pods move.
2. **Monitor node and cluster health** to anticipate and respond to pod scheduling events.
3. **Use affinity/anti-affinity rules** to control pod placement for performance or compliance reasons.

### Don't:
1. **Hard-code dependencies** on specific nodes or IP addresses, as pods are not guaranteed to stay on the same node.
2. **Ignore resource requests and limits**, as improper configurations can lead to unnecessary pod evictions.
3. **Overcommit cluster resources** without understanding the risks of pod preemption or throttling.

## Core Content
In Kubernetes and other container orchestration platforms, scheduling is the process of assigning pods to nodes within a cluster. A pod is the smallest deployable unit in Kubernetes, often encapsulating one or more containers. While the scheduler initially places pods on nodes based on resource availability, constraints, and policies, pods may later move for several reasons:

### Why Pods Move
1. **Resource Constraints**: If a node becomes overcommitted (e.g., insufficient CPU or memory), the scheduler may evict lower-priority pods to free up resources for higher-priority workloads.
2. **Node Failures**: If a node becomes unhealthy or unreachable, the pods running on it are rescheduled to other healthy nodes.
3. **Cluster Autoscaling**: When scaling down, nodes may be drained, causing pods to move to other nodes. Similarly, when scaling up, new nodes may host pods to balance the load.
4. **Policy Changes**: Updates to pod affinity/anti-affinity rules, taints, or tolerations can trigger pod rescheduling to enforce new placement rules.
5. **Preemption**: Higher-priority pods may preempt lower-priority ones, forcing the latter to move or terminate.
6. **Node Maintenance**: During planned maintenance or upgrades, nodes may be cordoned and drained, causing pods to move.

### Why It Matters
Pod movement is critical to ensuring the resilience, scalability, and efficiency of containerized applications. However, frequent or poorly managed pod movement can lead to disruptions, degraded performance, or increased costs. For example:
- **Disruption**: Stateful applications may experience downtime or data loss if not designed to handle pod movement.
- **Performance Impact**: Moving pods can temporarily affect application responsiveness due to container restarts or network reconfigurations.
- **Cost Implications**: Inefficient scheduling may lead to underutilized nodes or excessive scaling.

### Best Practices for Managing Pod Movement
1. **Resource Requests and Limits**: Properly configure resource requests and limits to help the scheduler make informed decisions and prevent unnecessary evictions.
2. **Pod Disruption Budgets (PDBs)**: Use PDBs to control the number of pods that can be disrupted during maintenance or scaling events.
3. **Affinity and Tolerations**: Define rules to ensure pods are scheduled in ways that align with application requirements, such as keeping related pods on the same node or separating them for fault tolerance.
4. **Readiness Probes**: Configure readiness probes to ensure that pods are only considered ready when they can handle traffic, reducing the impact of rescheduling.

### Example
Consider a web application with a frontend and a backend, both running in Kubernetes. The frontend pods are stateless, while the backend pods are stateful (e.g., a database). If a node hosting a backend pod fails, Kubernetes will reschedule the pod to another node. Without proper configuration (e.g., persistent volume claims), the backend pod may lose data or fail to restart correctly. By contrast, the stateless frontend pods can move seamlessly, as they do not rely on local state.

## Links
- **Kubernetes Scheduling Overview**: Detailed explanation of Kubernetes scheduling policies and mechanisms.
- **Pod Disruption Budgets**: Guidance on configuring PDBs to manage pod availability during disruptions.
- **Affinity and Anti-Affinity Rules**: Best practices for controlling pod placement in Kubernetes.
- **Cluster Autoscaler**: Documentation on how Kubernetes dynamically adjusts cluster size.

## Proof / Confidence
This content is based on Kubernetes documentation, industry best practices, and real-world scenarios observed in production environments. Kubernetes' scheduling behavior is governed by well-documented policies and algorithms, such as the default scheduler's bin-packing strategy and priority-based preemption. These practices align with cloud-native principles and are widely adopted across the industry.
