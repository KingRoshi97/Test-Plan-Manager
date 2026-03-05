---
kid: "KID-ITCMP-CHECK-0001"
title: "Container Security Checklist (least privilege, no root)"
type: "checklist"
pillar: "IT_END_TO_END"
domains:
  - "compute_virtualization"
subdomains: []
tags:
  - "compute_virtualization"
  - "checklist"
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

# Container Security Checklist (least privilege, no root)

```markdown
# Container Security Checklist (Least Privilege, No Root)

## Summary
This checklist provides actionable steps to secure containerized applications by adhering to the principles of least privilege and avoiding the use of root privileges. These practices mitigate risks such as privilege escalation, unauthorized access, and container breakout attacks, ensuring a more secure container runtime environment.

## When to Use
- When deploying containerized applications in production environments.
- During container image creation and CI/CD pipeline integration.
- When conducting security reviews or audits of containerized workloads.
- In multi-tenant environments where container isolation is critical.

## Do / Don't

### Do:
1. **Do use non-root users in your container images.**  
   Rationale: Running containers as a non-root user reduces the risk of privilege escalation if the container is compromised.
2. **Do define granular permissions using Role-Based Access Control (RBAC).**  
   Rationale: RBAC ensures that containers and users only have the permissions they need to perform their tasks.
3. **Do set resource limits on containers.**  
   Rationale: Prevents resource exhaustion attacks and ensures fair resource allocation across workloads.

### Don't:
1. **Don't run containers with the `--privileged` flag unless absolutely necessary.**  
   Rationale: The `--privileged` flag grants the container access to the host system, increasing the attack surface.
2. **Don't mount sensitive host directories (e.g., `/etc`, `/var/run/docker.sock`).**  
   Rationale: Mounting these directories can expose host-level configuration and control to the container.
3. **Don't use default or overly permissive network policies.**  
   Rationale: Lack of network segmentation can allow lateral movement between containers.

## Core Content

### 1. Use Non-Root Users
- **Action:** Add a non-root user to your Dockerfile using `RUN useradd -m appuser` and switch to it with `USER appuser`.  
- **Verification:** Inspect the container's runtime user with `docker exec <container_id> whoami`. Ensure it is not `root`.

### 2. Restrict Capabilities
- **Action:** Use the `--cap-drop` flag to remove unnecessary Linux capabilities. For example:  
  ```bash
  docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myimage
  ```
- **Verification:** Check the container's capabilities using `capsh --print` inside the container.

### 3. Avoid Privileged Mode
- **Action:** Do not use the `--privileged` flag unless absolutely necessary. Instead, explicitly define required capabilities using `--cap-add`.
- **Verification:** Review deployment configurations (e.g., Kubernetes manifests) to ensure `privileged: true` is not set.

### 4. Use Read-Only File Systems
- **Action:** Mount container file systems as read-only using the `--read-only` flag or by setting `readOnlyRootFilesystem: true` in Kubernetes.  
- **Verification:** Test write operations in the container to confirm they are restricted.

### 5. Limit Host Access
- **Action:** Avoid mounting sensitive host directories such as `/etc`, `/var/run/docker.sock`, or `/proc`.  
- **Verification:** Inspect the container's volume mounts with `docker inspect <container_id>` or Kubernetes manifests.

### 6. Implement Network Policies
- **Action:** Define Kubernetes NetworkPolicies to restrict pod-to-pod communication. For example:  
  ```yaml
  kind: NetworkPolicy
  apiVersion: networking.k8s.io/v1
  metadata:
    name: deny-all
  spec:
    podSelector: {}
    policyTypes:
    - Ingress
    - Egress
  ```
- **Verification:** Test connectivity between pods using tools like `curl` or `ping` to ensure policies are enforced.

### 7. Use Minimal Base Images
- **Action:** Use lightweight, minimal base images such as `alpine` or `distroless` to reduce the attack surface.  
- **Verification:** Check the image size and contents with `docker history <image>` and `docker inspect <image>`.

### 8. Scan Images for Vulnerabilities
- **Action:** Integrate image scanning tools (e.g., Trivy, Clair) into your CI/CD pipeline.  
- **Verification:** Review scan reports and ensure no critical vulnerabilities are present.

### 9. Enforce Resource Limits
- **Action:** Set CPU and memory limits in Kubernetes manifests. For example:  
  ```yaml
  resources:
    limits:
      memory: "512Mi"
      cpu: "500m"
  ```
- **Verification:** Monitor resource usage with tools like `kubectl top` or Prometheus.

## Links
- **CIS Docker Benchmark**: Guidelines for securing Docker containers and hosts.
- **Kubernetes Pod Security Standards**: Best practices for securing Kubernetes workloads.
- **OWASP Container Security Project**: Comprehensive container security resources.
- **Podman Documentation**: Alternative container runtime with rootless support.

## Proof / Confidence
This checklist is based on widely accepted industry standards, including the CIS Docker Benchmark and Kubernetes Pod Security Standards. Practices such as running non-root containers and restricting capabilities are commonly recommended by security experts and validated by security tools like Trivy and Clair. Following these steps aligns with the principle of least privilege, a cornerstone of secure system design.
```
