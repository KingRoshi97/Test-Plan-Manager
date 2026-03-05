---
kid: "KID-ITNET-REF-0001"
title: "Common Ports and Protocols Reference"
type: "reference"
pillar: "IT_END_TO_END"
domains:
  - "networking"
subdomains: []
tags:
  - "networking"
  - "reference"
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

# Common Ports and Protocols Reference

# Common Ports and Protocols Reference

## Summary
This article serves as a quick reference for commonly used ports and protocols in networking. It includes definitions, configuration parameters, and lookup values for standard communication protocols. Understanding these ports and protocols is essential for configuring firewalls, troubleshooting network issues, and ensuring secure communication.

---

## When to Use
- Configuring firewalls, routers, and network appliances to allow or block specific traffic.
- Diagnosing connectivity issues between systems or applications.
- Implementing security measures, such as restricting access to sensitive services.
- Designing network architectures that require protocol-specific routing or filtering.

---

## Do / Don't

### Do:
1. Use well-known ports (0–1023) for standard services (e.g., HTTP, HTTPS, SSH).
2. Document custom port assignments to avoid conflicts.
3. Restrict access to unused or sensitive ports to reduce attack surfaces.

### Don't:
1. Use ephemeral ports (49152–65535) for services that require consistent access.
2. Open all ports on a firewall without justification; this exposes the network to unnecessary risks.
3. Ignore protocol-specific requirements (e.g., TCP vs. UDP) when configuring services.

---

## Core Content

### Common Ports and Their Protocols
Below is a table of commonly used ports and their associated protocols:

| **Port** | **Protocol**      | **Description**                              | **Transport Layer** |
|----------|-------------------|----------------------------------------------|---------------------|
| 20, 21   | FTP               | File Transfer Protocol (data/control)        | TCP                 |
| 22       | SSH               | Secure Shell for remote administration       | TCP                 |
| 25       | SMTP              | Simple Mail Transfer Protocol (email)        | TCP                 |
| 53       | DNS               | Domain Name System                           | TCP/UDP             |
| 80       | HTTP              | Hypertext Transfer Protocol (web traffic)    | TCP                 |
| 443      | HTTPS             | Secure HTTP (encrypted web traffic)          | TCP                 |
| 110      | POP3              | Post Office Protocol (email retrieval)       | TCP                 |
| 143      | IMAP              | Internet Message Access Protocol (email)     | TCP                 |
| 3306     | MySQL             | Database communication                       | TCP                 |
| 3389     | RDP               | Remote Desktop Protocol                      | TCP                 |
| 5432     | PostgreSQL        | Database communication                       | TCP                 |
| 6379     | Redis             | In-memory data store                         | TCP                 |
| 8080     | HTTP (Alternate)  | Alternate port for HTTP                      | TCP                 |

### Key Definitions:
- **TCP (Transmission Control Protocol):** Ensures reliable, ordered, and error-checked delivery of data.
- **UDP (User Datagram Protocol):** Provides faster, connectionless communication without guaranteed delivery.
- **Ephemeral Ports:** Temporary ports used by client applications, ranging from 49152–65535.

### Configuration Options:
- **Firewall Rules:** Specify allowed/blocked ports and protocols to control traffic.
- **Port Forwarding:** Redirect traffic from one port to another for internal services.
- **Protocol Selection:** Ensure services use the correct transport layer protocol (TCP/UDP).

### Security Considerations:
- Block unused ports to minimize attack vectors.
- Use encryption protocols (e.g., HTTPS, SSH) to secure sensitive data.
- Regularly audit network configurations to ensure compliance with best practices.

---

## Links
- **IANA Port Numbers Registry:** Comprehensive list of assigned port numbers and protocols.
- **OSI Model Overview:** Understanding how ports and protocols fit within the networking stack.
- **Firewall Configuration Best Practices:** Guidelines for securing network traffic.

---

## Proof / Confidence
This reference is based on industry standards, including the Internet Assigned Numbers Authority (IANA) port registry and widely accepted networking practices. Ports and protocols listed are commonly used in enterprise environments and are supported by benchmarks from organizations such as NIST and CIS.
