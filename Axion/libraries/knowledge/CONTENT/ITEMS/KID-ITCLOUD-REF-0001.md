---
kid: "KID-ITCLOUD-REF-0001"
title: "Common Cloud Services Reference (compute/storage/net)"
content_type: "reference"
primary_domain: "platform_ops"
secondary_domains:
  - "cloud_fundamentals"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "c"
  - "l"
  - "o"
  - "u"
  - "d"
  - ","
  - " "
  - "c"
  - "o"
  - "m"
  - "p"
  - "u"
  - "t"
  - "e"
  - ","
  - " "
  - "s"
  - "t"
  - "o"
  - "r"
  - "a"
  - "g"
  - "e"
  - ","
  - " "
  - "n"
  - "e"
  - "t"
  - "w"
  - "o"
  - "r"
  - "k"
  - "i"
  - "n"
  - "g"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/cloud_fundamentals/references/KID-ITCLOUD-REF-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Common Cloud Services Reference (compute/storage/net)

# Common Cloud Services Reference (Compute/Storage/Net)

## Summary
This reference document provides a concise overview of common cloud services across compute, storage, and networking domains. It includes key definitions, configuration options, and practical guidance for platform operations and cloud fundamentals. Use this guide to ensure efficient and consistent cloud resource management.

---

## When to Use
- When provisioning cloud resources for new applications or workloads.
- When optimizing existing infrastructure for cost, performance, or scalability.
- When troubleshooting or auditing cloud environments for compliance or operational efficiency.
- During migration planning or hybrid cloud integration projects.

---

## Do / Don't

### Do:
1. **Do** use auto-scaling for compute resources to handle variable workloads efficiently.
2. **Do** implement storage lifecycle policies to manage cost and data retention.
3. **Do** design networks with security best practices, such as subnet segmentation and firewall rules.

### Don't:
1. **Don't** provision resources without tagging them for cost tracking and ownership.
2. **Don't** store sensitive data in public storage buckets without proper encryption and access controls.
3. **Don't** hard-code IP addresses or credentials in application configurations; use environment variables or secret management tools instead.

---

## Core Content

### 1. **Compute Services**
Compute services provide the processing power required to run applications, services, and workloads. Key options include:
- **Virtual Machines (VMs):** Fully customizable compute instances. Parameters include:
  - Instance type (e.g., `t2.micro`, `m5.large`).
  - Operating system (Linux/Windows).
  - CPU and memory allocation.
  - Attached storage (e.g., SSD, HDD).
- **Containers:** Lightweight, portable environments for running applications. Use managed services like Kubernetes or Docker.
- **Serverless Functions:** Event-driven compute services that scale automatically (e.g., AWS Lambda, Azure Functions).

#### Configuration Options:
| Parameter           | Description                              | Example Values         |
|---------------------|------------------------------------------|------------------------|
| Instance Type       | Determines CPU/memory configuration.    | `t2.micro`, `m5.large` |
| Scaling Policy      | Auto-scaling based on CPU utilization.  | 50% CPU threshold      |
| OS Image            | Operating system for the instance.      | Ubuntu 22.04, Windows 2019 |

---

### 2. **Storage Services**
Storage services handle data persistence and retrieval. Key types include:
- **Object Storage:** Scalable storage for unstructured data (e.g., S3, Azure Blob Storage). Common use cases: backups, media files.
- **Block Storage:** High-performance storage for databases and VMs (e.g., EBS, Azure Managed Disks).
- **File Storage:** Shared file systems for applications (e.g., Amazon EFS, Azure Files).

#### Configuration Options:
| Parameter           | Description                              | Example Values         |
|---------------------|------------------------------------------|------------------------|
| Storage Class       | Determines cost and performance.        | Standard, Infrequent Access, Archive |
| Encryption          | Protects data at rest.                  | AES-256, KMS keys      |
| Lifecycle Policy    | Automates data tiering/deletion.         | After 30 days, move to Glacier |

---

### 3. **Networking Services**
Networking services manage traffic flow and connectivity between resources. Key components include:
- **Virtual Private Cloud (VPC):** Isolated network environments for resources.
- **Subnets:** Logical subdivisions of a VPC for grouping resources.
- **Load Balancers:** Distribute traffic across multiple instances (e.g., ALB, NLB).
- **Firewalls/Security Groups:** Control inbound and outbound traffic.

#### Configuration Options:
| Parameter           | Description                              | Example Values         |
|---------------------|------------------------------------------|------------------------|
| CIDR Block          | Defines IP range for a VPC or subnet.   | `10.0.0.0/16`          |
| Security Group Rules| Allow/deny traffic based on ports/IPs.  | Allow TCP 443, Deny All |
| Load Balancer Type  | Determines traffic distribution method.  | Application, Network   |

---

## Links
- **Cloud Cost Optimization Best Practices:** Guidance on reducing cloud spend without sacrificing performance.
- **Cloud Security Standards:** Overview of security frameworks like CIS Benchmarks and NIST.
- **Networking in the Cloud:** A practical guide to designing secure and scalable cloud networks.
- **Storage Lifecycle Management:** How to implement lifecycle policies for cost-effective storage.

---

## Proof / Confidence
This document is based on industry standards, including the **CIS Benchmarks** for cloud security, **AWS Well-Architected Framework**, and **Google Cloud Architecture Framework**. These best practices are widely adopted across industries and validated by operational benchmarks.
