---
kid: "KID-ITNET-PITFALL-0001"
title: "DNS Misconfigurations That Break Prod"
type: "pitfall"
pillar: "IT_END_TO_END"
domains:
  - "networking"
subdomains: []
tags:
  - "networking"
  - "pitfall"
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

# DNS Misconfigurations That Break Prod

# DNS Misconfigurations That Break Prod

## Summary

DNS misconfigurations are a common pitfall in production environments, often leading to outages, degraded performance, or security vulnerabilities. These issues typically arise from incorrect DNS records, improper TTL settings, or failure to account for DNS propagation. Understanding these pitfalls and implementing robust DNS practices can prevent costly downtime and maintain system reliability.

## When to Use

This knowledge applies when:

- Configuring DNS records for production systems, including A, CNAME, MX, or TXT records.
- Migrating services to new domains or subdomains.
- Deploying applications that rely on external APIs or third-party services.
- Debugging connectivity issues in production environments.
- Implementing failover mechanisms or load balancing using DNS.

## Do / Don't

### Do:
1. **Do validate DNS changes in a staging environment** before applying them to production.
2. **Do monitor DNS resolution** using tools like `dig`, `nslookup`, or automated health checks.
3. **Do set appropriate TTL values** to balance between DNS propagation speed and caching efficiency.
4. **Do document DNS configurations** thoroughly, including the purpose of each record.
5. **Do use DNS providers with high reliability** and support for advanced features like DNSSEC.

### Don't:
1. **Don't make DNS changes directly in production** without testing or approval.
2. **Don't use overly aggressive TTLs** (e.g., 1 second) unless absolutely necessary, as this can increase DNS query load.
3. **Don't forget to account for DNS propagation delays** when making critical changes.
4. **Don't rely solely on DNS for failover**; implement additional mechanisms like health checks and load balancers.
5. **Don't ignore DNS security best practices**, such as enabling DNSSEC and avoiding wildcard records.

## Core Content

### The Mistake
DNS misconfigurations occur when DNS records are incorrectly set up or poorly maintained. Common errors include pointing records to incorrect IP addresses, misconfigured CNAME chains, missing MX records for email services, or setting inappropriate TTL values. These mistakes often happen due to rushed changes, lack of understanding of DNS principles, or poor documentation practices.

### Why People Make It
DNS is often perceived as "set and forget," leading to complacency. Engineers may underestimate the complexity of DNS propagation, fail to test changes thoroughly, or overlook dependencies between services. The pressure to resolve production issues quickly can also result in hasty, unverified DNS updates.

### Consequences
DNS misconfigurations can have severe consequences:
- **Outages:** Services become unreachable due to incorrect DNS records.
- **Performance degradation:** High TTL values can delay updates, while low TTL values can overload DNS servers.
- **Email failures:** Missing or incorrect MX records disrupt email delivery.
- **Security risks:** Misconfigured or missing DNSSEC can expose systems to spoofing or cache poisoning attacks.

### Detection
Detecting DNS misconfigurations requires proactive monitoring and troubleshooting:
- Use tools like `dig`, `nslookup`, or `host` to verify DNS resolution.
- Check DNS propagation using online tools to ensure changes are distributed globally.
- Monitor application logs for connectivity errors related to DNS resolution.
- Implement health checks to detect unreachable services caused by DNS issues.

### Fixing or Avoiding It
To fix DNS misconfigurations:
- Correct erroneous DNS records and verify changes using DNS lookup tools.
- Adjust TTL values to appropriate levels (e.g., 300 seconds for frequent updates, 86400 seconds for stable records).
- Ensure DNSSEC is enabled to prevent spoofing attacks.
- Re-test services after DNS updates to confirm functionality.

To avoid DNS misconfigurations:
- Establish a DNS change management process, including staging tests and approvals.
- Use version control for DNS configurations (e.g., GitOps for DNS).
- Train engineers on DNS fundamentals and best practices.
- Choose reliable DNS providers with robust monitoring and failover capabilities.

### Real-World Scenario
A SaaS company migrated its production environment to a new cloud provider and updated its DNS records to point to the new infrastructure. However, they forgot to adjust the TTL values beforehand, leaving them at 24 hours. As a result, customers experienced intermittent outages during the migration due to stale DNS records pointing to the old infrastructure. The company resolved the issue by lowering TTL values to 300 seconds prior to the migration and implementing a phased DNS update plan.

## Links

- **DNSSEC Best Practices:** Learn how DNSSEC protects against spoofing and cache poisoning.
- **Understanding TTL Values:** A guide to choosing appropriate TTL settings for DNS records.
- **DNS Monitoring Tools:** Explore tools for monitoring DNS resolution and propagation.
- **RFC 1034/1035:** The foundational standards for DNS architecture and operations.

## Proof / Confidence

This content is supported by industry standards, including RFC 1034 and RFC 1035, which define the DNS protocol and best practices. Common benchmarks and case studies highlight DNS misconfigurations as a frequent cause of production outages. Tools like `dig` and `nslookup` are widely used for DNS troubleshooting, and DNSSEC adoption is recommended by security organizations such as NIST.
