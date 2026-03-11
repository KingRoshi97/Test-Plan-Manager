---
kid: "KID-ITNET-CONCEPT-0002"
title: "DNS Basics (records, resolution, TTL)"
content_type: "concept"
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
  - "concept"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/networking/concepts/KID-ITNET-CONCEPT-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# DNS Basics (records, resolution, TTL)

# DNS Basics (records, resolution, TTL)

## Summary
The Domain Name System (DNS) is a foundational component of networking that translates human-readable domain names (e.g., `example.com`) into machine-readable IP addresses (e.g., `192.0.2.1`). It operates through a hierarchical structure of records, resolution processes, and Time-to-Live (TTL) values. Understanding DNS is critical for ensuring reliable and efficient communication in modern networks.

## When to Use
- **Configuring a new domain or subdomain**: When setting up websites, email servers, or other hosted services.
- **Troubleshooting connectivity issues**: Diagnosing problems such as "domain not found" errors or slow website loading due to DNS misconfigurations.
- **Optimizing network performance**: Adjusting TTL values to balance caching efficiency and responsiveness to changes.
- **Implementing custom DNS settings**: For load balancing, failover configurations, or security enhancements like DNSSEC.

## Do / Don't

### Do
1. **Use appropriate DNS record types** (e.g., `A` for IPv4, `AAAA` for IPv6, `MX` for mail servers) to ensure proper functionality.
2. **Set TTL values strategically**: Use shorter TTLs for frequently changing records and longer TTLs for static records to optimize caching.
3. **Regularly audit DNS configurations** to remove outdated records and ensure consistency.

### Don't
1. **Don't use wildcard DNS records (`*`) carelessly**: They can cause unexpected behavior and security vulnerabilities.
2. **Don't leave DNS records pointing to deprecated or unused IPs**: This can lead to misrouting or potential security risks.
3. **Don't ignore DNS propagation times**: Changes to DNS records may take time to propagate globally, depending on TTL settings.

## Core Content

DNS is a distributed, hierarchical system that enables devices to locate resources on a network. It consists of several key components:

### DNS Records
DNS records are structured data entries stored on authoritative DNS servers. Common record types include:
- **A Record**: Maps a domain name to an IPv4 address (e.g., `example.com -> 192.0.2.1`).
- **AAAA Record**: Maps a domain name to an IPv6 address (e.g., `example.com -> 2001:db8::1`).
- **CNAME Record**: Creates an alias for another domain (e.g., `www.example.com -> example.com`).
- **MX Record**: Specifies mail servers for a domain (e.g., `example.com -> mail.example.com`).
- **TXT Record**: Stores arbitrary text, often used for verification or security purposes (e.g., SPF, DKIM).

### DNS Resolution
DNS resolution is the process of converting a domain name into its corresponding IP address. It involves multiple steps:
1. **Recursive Resolver**: A DNS client queries a recursive resolver (e.g., provided by an ISP or a public DNS service like Google DNS).
2. **Root Server**: The resolver contacts a root DNS server, which directs it to the appropriate top-level domain (TLD) server (e.g., `.com`, `.org`).
3. **TLD Server**: The TLD server points to the authoritative server for the specific domain.
4. **Authoritative Server**: The authoritative server provides the final answer (e.g., the IP address for the domain).

### Time-to-Live (TTL)
TTL is a value in DNS records that specifies how long a record can be cached by resolvers before it must be refreshed. For example:
- A TTL of `3600` seconds (1 hour) means that DNS resolvers will cache the record for 1 hour before querying the authoritative server again.
- Short TTLs (e.g., `300` seconds) are useful for dynamic environments but increase DNS query load.
- Long TTLs (e.g., `86400` seconds) reduce query load but delay propagation of updates.

### Why DNS Matters
DNS is critical for:
1. **Usability**: It allows users to access resources using domain names instead of numeric IP addresses.
2. **Scalability**: Its hierarchical design enables the efficient management of billions of domains and IPs.
3. **Performance**: Properly configured DNS can reduce latency and improve user experience.
4. **Security**: DNSSEC and other mechanisms help protect against attacks like DNS spoofing and cache poisoning.

### Example
Consider a user accessing `www.example.com`. The DNS resolution process might look like this:
1. The user's browser queries a recursive resolver for `www.example.com`.
2. The resolver contacts a root server, which directs it to the `.com` TLD server.
3. The TLD server points to the authoritative server for `example.com`.
4. The authoritative server returns the `A` record for `www.example.com` (e.g., `192.0.2.1`).
5. The browser uses the IP address to establish a connection.

## Links
- **DNS Record Types**: Detailed explanation of DNS record types and their use cases.
- **DNS Resolution Process**: Overview of how DNS queries are resolved step-by-step.
- **DNS TTL Best Practices**: Guidelines for setting TTL values based on use case.
- **DNSSEC Overview**: Introduction to DNS Security Extensions for securing DNS.

## Proof / Confidence
This content is based on widely accepted industry standards, including RFC 1034 and RFC 1035, which define DNS. Best practices are informed by authoritative sources such as ICANN, IETF, and operational guidelines from major DNS providers (e.g., Cloudflare, Google). DNS is a mature technology with decades of proven reliability and scalability in global networks.
