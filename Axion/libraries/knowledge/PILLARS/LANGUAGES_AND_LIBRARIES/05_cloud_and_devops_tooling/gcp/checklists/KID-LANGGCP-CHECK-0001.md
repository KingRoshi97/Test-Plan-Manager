---
kid: "KID-LANGGCP-CHECK-0001"
title: "Gcp Production Readiness Checklist"
type: "checklist"
pillar: "LANGUAGES_AND_LIBRARIES"
domains:
  - "gcp"
subdomains: []
tags:
  - "gcp"
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

# Gcp Production Readiness Checklist

# GCP Production Readiness Checklist

## Summary
This checklist ensures that applications deployed on Google Cloud Platform (GCP) are production-ready, reliable, secure, and scalable. It focuses on preparing your code, libraries, and dependencies for robust operation under real-world conditions. Following this checklist minimizes downtime, optimizes performance, and ensures compliance with best practices for GCP-based systems.

---

## When to Use
- Before deploying a new application or service to production on GCP.
- When migrating an existing workload to GCP.
- During periodic audits of production systems to ensure ongoing compliance with best practices.
- When introducing significant changes to your codebase, libraries, or dependencies.

---

## Do / Don't

### Do
1. **Do use GCP-managed libraries** for services like Pub/Sub, BigQuery, and Cloud Storage to ensure compatibility and optimal performance.
2. **Do configure IAM roles and permissions** following the principle of least privilege to secure access to resources.
3. **Do implement health checks** for all services and endpoints to enable automated failure detection and recovery.
4. **Do enable Stackdriver Monitoring and Logging** to track application performance and troubleshoot issues effectively.
5. **Do set resource quotas and limits** to prevent unexpected overages or resource exhaustion.

### Don't
1. **Don't hardcode credentials** in your application; use Secret Manager or Application Default Credentials instead.
2. **Don't ignore regional redundancy**; always configure multi-region backups and failover for critical data.
3. **Don't deploy without stress testing**; ensure your application can handle peak loads and fail gracefully.
4. **Don't skip dependency versioning**; always pin versions to avoid unexpected behavior due to updates.
5. **Don't disable auto-scaling** unless absolutely necessary; it ensures your application can handle variable workloads.

---

## Core Content

### 1. **Code and Dependency Preparation**
   - Ensure all dependencies are up-to-date and compatible with your runtime environment.
   - Use dependency scanning tools like `OSV Scanner` or `Snyk` to identify vulnerabilities.
   - Pin dependency versions in `requirements.txt`, `package.json`, or equivalent files to avoid unexpected updates.

### 2. **Security Configuration**
   - Use **Cloud IAM** to set granular permissions for resources. Avoid using overly broad roles like `roles/editor`.
   - Store sensitive data, such as API keys and passwords, in **Secret Manager**. Rotate secrets regularly.
   - Enable **Cloud Audit Logs** for all services to track access and changes.

### 3. **Monitoring and Logging**
   - Set up **Stackdriver Logging** and **Monitoring** to collect metrics and logs for all services.
   - Configure alerts for key metrics such as CPU usage, memory usage, and error rates.
   - Use **Cloud Trace** to analyze latency and optimize performance.

### 4. **Scalability and Resilience**
   - Enable **auto-scaling** for Compute Engine instances, Kubernetes clusters, and App Engine services.
   - Configure **load balancing** with health checks to distribute traffic effectively.
   - Use **Cloud SQL failover replicas** or **Spanner multi-region configurations** for database redundancy.

### 5. **Disaster Recovery**
   - Implement **multi-region storage** for critical data using Cloud Storage or BigQuery.
   - Test backup and restore procedures regularly.
   - Define and document your **incident response plan**, including escalation paths and recovery steps.

### 6. **Performance Testing**
   - Conduct load testing using tools like **k6** or **Apache JMeter** to simulate peak traffic.
   - Test application behavior under failure scenarios, such as database outages or API timeouts.
   - Optimize database queries and caching strategies to minimize latency.

---

## Links
1. [GCP IAM Best Practices](https://cloud.google.com/iam/docs/best-practices) - Guidance on configuring secure access to GCP resources.
2. [Stackdriver Monitoring Overview](https://cloud.google.com/stackdriver/docs/monitoring) - Documentation for setting up monitoring and alerts.
3. [Google Cloud Secret Manager](https://cloud.google.com/secret-manager/docs) - Best practices for securely managing secrets.
4. [GCP Auto-scaling Guide](https://cloud.google.com/compute/docs/autoscaler) - Instructions for configuring auto-scaling on Compute Engine.

---

## Proof / Confidence
This checklist is based on industry standards such as the **Google Cloud Architecture Framework**, which outlines best practices for reliability, security, and scalability. Tools like **Stackdriver** and **Secret Manager** are widely adopted by organizations leveraging GCP. Regular audits and stress testing are common practices across the software industry to ensure production readiness. Following these guidelines aligns with benchmarks set by leading cloud providers and ensures compliance with modern operational standards.
