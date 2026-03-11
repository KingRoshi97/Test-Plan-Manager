---
kid: "KID-ITSRE-PATTERN-0002"
title: "Health Check Pattern (liveness/readiness)"
content_type: "pattern"
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
  - "h"
  - "e"
  - "a"
  - "l"
  - "t"
  - "h"
  - "-"
  - "c"
  - "h"
  - "e"
  - "c"
  - "k"
  - ","
  - " "
  - "l"
  - "i"
  - "v"
  - "e"
  - "n"
  - "e"
  - "s"
  - "s"
  - ","
  - " "
  - "r"
  - "e"
  - "a"
  - "d"
  - "i"
  - "n"
  - "e"
  - "s"
  - "s"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/observability_sre/patterns/KID-ITSRE-PATTERN-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Health Check Pattern (liveness/readiness)

# Health Check Pattern (Liveness/Readiness)

## Summary
The Health Check Pattern is a critical design practice in modern software delivery and observability. It ensures that services can signal their operational status to orchestrators, load balancers, and other systems. By implementing **liveness** and **readiness** probes, this pattern helps maintain system reliability, scalability, and fault tolerance in distributed systems.

## When to Use
- When deploying applications in containerized environments (e.g., Kubernetes, Docker).
- When using load balancers or service meshes that route traffic to healthy instances.
- In microservices architectures where service availability and dependency health are critical.
- When you need to automate failure recovery or scaling decisions.
- To monitor and alert on service health in production environments.

## Do / Don't

### Do:
1. **Do implement liveness checks** to detect and recover from application crashes, deadlocks, or unresponsive states.
2. **Do implement readiness checks** to signal when the application is ready to serve traffic (e.g., after warming up or loading configurations).
3. **Do use lightweight and fast checks** to minimize resource overhead and avoid false positives.
4. **Do test health checks in staging environments** to ensure they behave correctly under various scenarios.
5. **Do document health check endpoints** so they are understood by developers, SREs, and DevOps teams.

### Don’t:
1. **Don’t use the same endpoint for liveness and readiness probes**; they serve different purposes.
2. **Don’t include expensive operations** (e.g., database queries) in liveness checks; it may cause cascading failures.
3. **Don’t hard-code fixed thresholds** for health check failures; make them configurable for flexibility.
4. **Don’t assume all dependencies must be healthy** for readiness; some services may function in degraded states.
5. **Don’t expose health check endpoints publicly** without proper authentication or access controls.

## Core Content

### Problem
In distributed systems, services can fail or become unavailable due to crashes, resource exhaustion, or dependency failures. Without a mechanism to detect and handle unhealthy services, systems risk degraded performance, cascading failures, and poor user experience.

### Solution
The Health Check Pattern introduces **liveness** and **readiness** probes to monitor and manage service health:
- **Liveness Probe**: Detects whether the application is alive and functioning. If the probe fails, the orchestrator (e.g., Kubernetes) restarts the application.
- **Readiness Probe**: Determines if the application is ready to handle traffic. If the probe fails, the orchestrator removes the instance from the load balancer's pool.

### Implementation Steps
1. **Define Health Check Endpoints**:
   - Implement two separate HTTP endpoints or commands for liveness and readiness checks.
   - Example:
     - `/health/liveness`: Returns `200 OK` if the application is alive.
     - `/health/readiness`: Returns `200 OK` if the application is ready to serve traffic.

2. **Configure Liveness Probes**:
   - In Kubernetes, define a `livenessProbe` in the pod specification:
     ```yaml
     livenessProbe:
       httpGet:
         path: /health/liveness
         port: 8080
       initialDelaySeconds: 5
       periodSeconds: 10
     ```
   - Use lightweight checks, such as verifying the main thread is responsive.

3. **Configure Readiness Probes**:
   - Define a `readinessProbe` in the pod specification:
     ```yaml
     readinessProbe:
       httpGet:
         path: /health/readiness
         port: 8080
       initialDelaySeconds: 10
       periodSeconds: 5
     ```
   - Include checks for critical dependencies (e.g., database connections, external services).

4. **Handle Probe Failures Gracefully**:
   - Ensure the application logs diagnostic information when health checks fail.
   - Avoid triggering restarts unnecessarily by setting appropriate thresholds (e.g., `failureThreshold`).

5. **Secure Health Check Endpoints**:
   - Restrict access to health check endpoints using network policies or authentication.
   - Avoid exposing sensitive information in health check responses.

6. **Test in Controlled Environments**:
   - Simulate failure scenarios (e.g., crash loops, dependency downtime) to validate probe behavior.

### Tradeoffs
- **Pros**:
  - Improves fault tolerance by enabling self-healing mechanisms.
  - Ensures traffic is only routed to healthy instances.
  - Simplifies monitoring and debugging.
- **Cons**:
  - Adds implementation complexity.
  - Poorly designed probes can cause unnecessary restarts or downtime.
  - Resource overhead if probes are too frequent or expensive.

### Alternatives
- Use **startup probes** (Kubernetes) for applications with long initialization times.
- For simple environments, use basic monitoring tools (e.g., uptime checks) instead of liveness/readiness probes.
- For legacy systems, consider external health monitoring tools like Pingdom or New Relic.

## Links
- **Kubernetes Probes Documentation**: Explains liveness, readiness, and startup probes in Kubernetes.
- **Circuit Breaker Pattern**: A complementary pattern for managing dependency failures.
- **Service Mesh Health Checks**: How service meshes like Istio or Linkerd handle health checks.
- **12-Factor App Methodology**: Guidelines for building resilient, scalable applications.

## Proof / Confidence
- Kubernetes documentation and best practices recommend liveness and readiness probes for container orchestration.
- Industry leaders (Google, Netflix, Amazon) implement health checks in their distributed systems.
- The pattern aligns with the **12-Factor App** principles for modern application design.
- Proven to reduce downtime and improve reliability in production environments.
