---
kid: "KID-ITNET-EXAMPLE-0001"
title: "Example Network Diagram (simple web app)"
content_type: "reference"
primary_domain: "networking"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "networking"
  - "example"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/networking/examples/KID-ITNET-EXAMPLE-0001.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Example Network Diagram (simple web app)

# Example Network Diagram (Simple Web App)

## Summary
This article provides a worked example of a basic network diagram for a simple web application. The scenario demonstrates how to design and document a network architecture for a small-scale web app with a frontend, backend, and database, hosted in a cloud environment. Key decisions and their rationale are explained to help guide similar implementations.

---

## When to Use
- When designing a small-scale web application with minimal infrastructure complexity.
- When creating documentation for stakeholders or team members unfamiliar with the network setup.
- When planning a cloud-hosted deployment for a web app with basic security and scalability requirements.

---

## Do / Don't

### Do:
1. Use clear and consistent naming conventions for all components in the diagram.
2. Include security layers such as firewalls, private subnets, and load balancers.
3. Document both the logical and physical flow of traffic between components.

### Don't:
1. Overcomplicate the diagram with unnecessary details or components.
2. Expose sensitive services (e.g., databases) directly to the public internet.
3. Ignore scalability considerations, even for a simple setup.

---

## Core Content

### Scenario
You are tasked with designing the network architecture for a simple web application. The application consists of:
- A frontend web server hosting a React-based UI.
- A backend API server built with Node.js.
- A PostgreSQL database for data storage.

The application will be deployed in a cloud environment (e.g., AWS) and must include basic scalability, security, and fault tolerance.

### Step-by-Step Solution

#### 1. Define Network Requirements
- **Public Access**: The frontend must be accessible to users over the internet.
- **Private Access**: The backend and database should be isolated from direct public access.
- **Scalability**: The frontend and backend should support horizontal scaling.
- **Security**: Implement firewalls and restrict access to sensitive components.

#### 2. Design the Network Layout
The network architecture will include:
- A **Virtual Private Cloud (VPC)** with two subnets:
  - **Public Subnet**: For internet-facing components (e.g., frontend and load balancer).
  - **Private Subnet**: For internal components (e.g., backend and database).
- A **Load Balancer** in the public subnet to distribute traffic to the frontend servers.
- **Frontend Servers** (e.g., EC2 instances or containers) in the public subnet.
- **Backend Servers** in the private subnet, accessible only by the frontend.
- A **Database Server** in the private subnet, accessible only by the backend.

#### 3. Implement Security Measures
- Attach a **Security Group** to the load balancer to allow inbound traffic on port 80 (HTTP) and 443 (HTTPS).
- Attach a **Security Group** to the backend servers to allow traffic only from the frontend servers on port 8080 (API).
- Attach a **Security Group** to the database server to allow traffic only from the backend servers on port 5432 (PostgreSQL).
- Use **Network ACLs** to add an additional layer of subnet-level security.

#### 4. Create the Network Diagram
A simple diagram for this setup might look like this:

```
Internet
   |
[Load Balancer]
   |
[Public Subnet]
   |
[Frontend Servers]
   |
[Private Subnet]
   |
[Backend Servers] --- [Database Server]
```

#### 5. Key Decisions and Rationale
- **Subnets**: Separating public and private subnets ensures that sensitive resources (backend and database) are not exposed to the internet.
- **Load Balancer**: Improves fault tolerance and scalability for the frontend.
- **Security Groups**: Enforce the principle of least privilege, allowing only necessary traffic between components.
- **Cloud Hosting**: Using a cloud provider simplifies scalability and reduces operational overhead.

---

## Links
- **Best Practices for AWS VPC Design**: Guidance on creating secure and scalable VPC architectures.
- **OWASP Secure Network Architecture**: Recommendations for securing application networks.
- **PostgreSQL Security Best Practices**: Tips for securing PostgreSQL databases.
- **Load Balancer Design Patterns**: Overview of common load balancing strategies.

---

## Proof / Confidence
This example aligns with industry standards for network design, including best practices from cloud providers like AWS and Azure. The architecture adheres to the principle of least privilege and uses proven components (e.g., VPCs, subnets, and security groups). Similar designs are commonly used in small-to-medium-scale web applications and are documented in resources like the AWS Well-Architected Framework and OWASP guidelines.
