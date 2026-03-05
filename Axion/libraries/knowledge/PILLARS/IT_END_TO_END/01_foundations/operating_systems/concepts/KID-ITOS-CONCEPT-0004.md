---
kid: "KID-ITOS-CONCEPT-0004"
title: "Resource Limits (CPU/RAM/FDs)"
type: "concept"
pillar: "IT_END_TO_END"
domains:
  - "operating_systems"
subdomains: []
tags:
  - "operating_systems"
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

# Resource Limits (CPU/RAM/FDs)

# Resource Limits (CPU/RAM/FDs)

## Summary
Resource limits define the maximum amount of system resources (CPU, RAM, file descriptors, etc.) that a process or user can consume on an operating system. These limits are critical for ensuring system stability, preventing resource exhaustion, and maintaining fair resource allocation across processes. Properly configuring resource limits is essential in multi-user or multi-process environments.

## When to Use
- When deploying applications on shared systems to prevent one process from monopolizing resources.
- In containerized environments (e.g., Docker, Kubernetes) to enforce resource quotas and ensure predictable performance.
- During system hardening to mitigate denial-of-service (DoS) attacks by limiting resource abuse.
- For debugging or testing purposes to simulate constrained environments and assess application behavior under resource pressure.

## Do / Don't
### Do:
1. **Set limits for critical system resources (CPU, RAM, FDs) in production environments.**
2. **Monitor resource usage and adjust limits based on application requirements and observed behavior.**
3. **Use soft limits for warnings and hard limits to enforce strict boundaries.**

### Don't:
1. **Set resource limits arbitrarily without understanding the application's resource needs.**
2. **Ignore file descriptor (FD) limits, especially for applications handling many simultaneous connections (e.g., web servers).**
3. **Apply overly restrictive limits that could cause critical processes to fail unexpectedly.**

## Core Content
Resource limits are a fundamental concept in operating systems, used to control the allocation of finite system resources to processes or users. These limits are typically enforced by the kernel and can be configured via system utilities, configuration files, or container orchestration platforms.

### Types of Resource Limits
1. **CPU Limits**: Restrict the amount of CPU time a process can consume. This is typically measured in percentage of CPU cores or in time slices (e.g., milliseconds). For example, in Linux, the `cgroups` mechanism allows fine-grained control over CPU usage for processes or containers.
2. **RAM Limits**: Constrain the amount of physical memory a process can use. Exceeding this limit may lead to process termination or swapping, which can degrade performance. Tools like `ulimit` or container runtimes (e.g., Docker) allow memory limits to be specified.
3. **File Descriptor (FD) Limits**: Control the maximum number of open file descriptors a process can have. Each open file, socket, or pipe consumes a file descriptor. Applications like web servers or databases, which handle many concurrent connections, require high FD limits to function properly.

### Why Resource Limits Matter
- **System Stability**: Without limits, a single process can consume all available resources, leading to system crashes or degraded performance.
- **Fair Resource Allocation**: In multi-user or multi-process environments, limits ensure that resources are distributed equitably.
- **Security**: Resource limits can mitigate the impact of malicious or runaway processes, reducing the risk of DoS attacks.
- **Performance Tuning**: Properly configured limits help maintain predictable system performance under varying workloads.

### Example Use Cases
1. **Web Server Configuration**: A web server like Nginx or Apache may handle thousands of concurrent connections. Setting a high FD limit (e.g., `ulimit -n 65535`) ensures that the server can open sufficient sockets without hitting the FD cap.
2. **Containerized Applications**: In Kubernetes, resource requests and limits can be defined in `Pod` specifications to allocate a specific amount of CPU and memory to each container. For example:
   ```yaml
   resources:
     requests:
       memory: "512Mi"
       cpu: "500m"
     limits:
       memory: "1Gi"
       cpu: "1"
   ```
3. **Development Environments**: During testing, developers can simulate low-resource environments by setting restrictive limits (e.g., `ulimit -v` for virtual memory) to observe application behavior under stress.

### How to Configure Resource Limits
- **Linux `ulimit`**: Use the `ulimit` command to set per-session limits. For example, `ulimit -n 1024` sets the maximum number of open file descriptors to 1024.
- **System Configuration Files**: Persistent limits can be configured in `/etc/security/limits.conf` or via PAM modules.
- **Container Runtimes**: Docker and Kubernetes provide native mechanisms for defining resource limits at the container level.

## Links
- **Linux `ulimit` Command**: Overview of `ulimit` and its usage for managing resource limits.
- **cgroups (Control Groups)**: Linux kernel feature for resource management and isolation.
- **Kubernetes Resource Management**: Documentation on setting resource requests and limits in Kubernetes.
- **File Descriptors in Linux**: Explanation of file descriptors and their role in system resource management.

## Proof / Confidence
- **POSIX Standards**: The POSIX.1 standard defines resource limits and their implementation in Unix-like operating systems.
- **Linux Kernel Documentation**: The Linux kernel provides extensive documentation on cgroups and resource management.
- **Industry Best Practices**: Resource limits are widely used in production environments across industries to ensure stability and security. For example, Kubernetes enforces resource limits by design to prevent resource contention in containerized applications.
