---
kid: "KID-ITCLOUD-CONCEPT-0003"
title: "VPC/VNet Basics (subnets, routing)"
content_type: "concept"
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
  - ","
  - " "
  - "v"
  - "p"
  - "c"
  - ","
  - " "
  - "v"
  - "n"
  - "e"
  - "t"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/04_platform_ops/cloud_fundamentals/concepts/KID-ITCLOUD-CONCEPT-0003.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# VPC/VNet Basics (subnets, routing)

# VPC/VNet Basics (Subnets, Routing)

## Summary
A Virtual Private Cloud (VPC) or Virtual Network (VNet) is a logically isolated network in the cloud that allows users to define and control their networking environment. Key components include subnets, which segment the network, and routing, which controls traffic flow. VPCs/VNets enable secure, scalable, and flexible network configurations for cloud resources.

## When to Use
- When deploying applications or services in the cloud that require network isolation and control.
- To establish secure communication between cloud resources, on-premises data centers, or external systems.
- To enforce compliance with organizational or regulatory networking requirements.
- When needing to segment workloads into different subnets for security, performance, or operational management.
- To define custom routing rules for directing traffic between subnets, external networks, and internet gateways.

## Do / Don't

### Do:
1. **Do segment your VPC/VNet into subnets** based on workload type (e.g., public-facing, private, database) for better security and traffic management.
2. **Do use Network Access Control Lists (NACLs) and Security Groups** to enforce fine-grained access control at the subnet and instance levels.
3. **Do plan your IP address ranges carefully** to avoid overlap with on-premises networks or other VPCs/VNets in your environment.

### Don't:
1. **Don't use a single large subnet** for all resources; this can lead to poor traffic isolation and management.
2. **Don't open all ports or allow unrestricted internet access** in your routing and security configurations.
3. **Don't neglect monitoring and logging** of VPC/VNet activity, as this is critical for troubleshooting and security auditing.

## Core Content

A Virtual Private Cloud (VPC) in AWS or a Virtual Network (VNet) in Azure provides a private, isolated environment for deploying cloud resources. These constructs allow organizations to replicate the functionality of traditional on-premises networks in the cloud, with added scalability and flexibility.

### Subnets
Subnets are subdivisions of a VPC/VNet's IP address range. They are used to group resources logically and control traffic flow. Subnets can be classified as:
- **Public Subnets**: Resources in these subnets have direct access to the internet via an Internet Gateway (AWS) or Public IP (Azure). Use these for web servers or other public-facing services.
- **Private Subnets**: Resources in these subnets do not have direct internet access. They are typically used for backend services like databases or application servers.
- **Isolated Subnets**: In some cases, subnets may be completely isolated from both the internet and other subnets for high-security workloads.

For example, a three-tier application might use:
- A public subnet for the web tier.
- A private subnet for the application tier.
- Another private subnet for the database tier.

### Routing
Routing defines how traffic is directed within the VPC/VNet and between external networks. Each subnet is associated with a route table, which contains rules that determine the next hop for traffic. Key routing components include:
- **Internet Gateways (AWS) or Public IPs (Azure)**: Enable outbound and inbound internet access for public subnets.
- **NAT Gateways**: Allow resources in private subnets to access the internet for updates or external APIs while remaining inaccessible from the internet.
- **Peering Connections**: Facilitate communication between VPCs/VNets in the same or different regions.
- **VPN Gateways**: Provide secure connectivity between the VPC/VNet and on-premises networks.

For example, a route table for a private subnet might include:
- A route to the NAT Gateway for internet-bound traffic.
- A route to a peering connection for inter-VPC communication.

### Why It Matters
VPCs/VNets are foundational to cloud networking. They provide the flexibility to design networks that meet specific application, security, and compliance requirements. By using subnets and routing effectively, organizations can:
- Improve security by isolating sensitive workloads.
- Optimize performance by localizing traffic within subnets.
- Simplify management by grouping resources logically.

In the broader domain of platform operations and cloud fundamentals, VPCs/VNets are critical for enabling hybrid cloud architectures, multi-cloud strategies, and scalable application deployments.

## Links
- **Cloud Networking Best Practices**: Guidelines for designing secure and scalable cloud networks.
- **AWS VPC Documentation**: Detailed documentation on AWS VPC components and configurations.
- **Azure VNet Documentation**: Comprehensive guide to Azure VNet features and use cases.
- **Hybrid Cloud Networking**: Overview of integrating on-premises and cloud networks.

## Proof / Confidence
This content is based on industry standards and best practices from leading cloud providers such as AWS, Azure, and Google Cloud. Subnetting and routing are foundational concepts in networking, with well-established principles documented in RFC 1918 (private IP addressing) and RFC 4632 (CIDR). Additionally, cloud provider documentation and case studies validate the importance of proper VPC/VNet design for security and performance.
