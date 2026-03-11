---
kid: "KID-ITSEC-PITFALL-0005"
title: "Over-permissive CORS and Public RPC"
content_type: "reference"
primary_domain: "security_fundamentals"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "security_fundamentals"
  - "pitfall"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/security_fundamentals/pitfalls/KID-ITSEC-PITFALL-0005.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# Over-permissive CORS and Public RPC

# Over-permissive CORS and Public RPC

## Summary

Over-permissive Cross-Origin Resource Sharing (CORS) configurations and unsecured Public Remote Procedure Call (RPC) endpoints are common security pitfalls in web applications and APIs. These issues can expose sensitive data, enable unauthorized access, and create attack vectors for malicious actors. Developers often misconfigure CORS or leave RPC endpoints open due to convenience or lack of understanding, leading to severe security vulnerabilities.

---

## When to Use

This guidance applies in the following scenarios:

- When developing or maintaining web applications, APIs, or services that use CORS to manage cross-origin requests.
- When exposing RPC endpoints for public or internal use, especially in blockchain-based systems or microservices architectures.
- When integrating third-party services that require CORS or RPC access.

---

## Do / Don't

### Do:
1. **Restrict CORS origins**: Configure CORS to allow only trusted origins that need access to your resources.
2. **Validate incoming RPC requests**: Ensure that RPC endpoints verify requests using authentication and authorization mechanisms.
3. **Audit configurations regularly**: Perform routine checks on CORS policies and RPC endpoint access controls to identify misconfigurations.

### Don't:
1. **Allow `*` in CORS origins**: Avoid using the wildcard (`*`) to grant access to all origins, as this opens the application to abuse.
2. **Expose sensitive RPC endpoints publicly**: Do not make RPC endpoints accessible without proper authentication and rate limiting.
3. **Ignore error logs**: Do not overlook CORS or RPC-related errors in logs, as they can indicate potential misuse or attacks.

---

## Core Content

### The Mistake
Over-permissive CORS configurations often occur when developers use `Access-Control-Allow-Origin: *` or fail to restrict origins to trusted domains. Similarly, Public RPC endpoints are frequently left exposed without authentication or access control, allowing anyone to interact with backend services. These issues arise from a desire to simplify development or avoid breaking functionality during integration.

### Why People Make It
- **Convenience**: Developers may set permissive CORS policies or open RPC endpoints during development and forget to tighten them in production.
- **Misunderstanding**: A lack of understanding about the security implications of CORS and RPC can lead to poor configurations.
- **Pressure to deliver**: Tight deadlines can lead to shortcuts that compromise security.

### Consequences
1. **Data Exposure**: Over-permissive CORS allows malicious domains to access sensitive data via your API.
2. **Unauthorized Actions**: Public RPC endpoints can be exploited to perform unauthorized operations, such as transferring funds or modifying configurations.
3. **Exploitation by Attackers**: Attackers can use these vulnerabilities for cross-site scripting (XSS), data theft, or denial-of-service (DoS) attacks.

### How to Detect It
1. **Inspect CORS Policies**: Use tools like browser developer consoles or security scanners (e.g., OWASP ZAP) to analyze CORS headers.
2. **Audit RPC Endpoints**: Check for endpoints that are accessible without authentication or rate limiting.
3. **Monitor Logs**: Look for unusual patterns in logs, such as repeated requests from unknown origins or suspicious RPC calls.

### How to Fix or Avoid It
1. **Restrict CORS Origins**: Replace `*` with specific trusted domains in the `Access-Control-Allow-Origin` header. Use environment-specific configurations to manage origins dynamically.
2. **Implement Authentication**: Require API keys, OAuth tokens, or other authentication mechanisms for RPC endpoints.
3. **Apply Rate Limiting**: Prevent abuse by limiting the number of requests allowed per user or IP address.
4. **Use Middleware**: Employ middleware to validate requests and enforce access control.
5. **Educate Developers**: Train teams on the importance of secure CORS and RPC configurations and provide guidelines for best practices.

### Real-World Scenario
In 2022, a blockchain platform exposed its Public RPC endpoint without authentication. Attackers exploited this to drain funds from user accounts by crafting malicious RPC requests. The platform's CORS policy also allowed `*`, enabling attackers to trigger these requests from malicious websites. The incident resulted in millions of dollars in losses and damaged the platform's reputation.

---

## Links

- **OWASP CORS Misconfiguration Guide**: Best practices for securely configuring CORS.
- **OWASP API Security Top 10**: Common API vulnerabilities and mitigation strategies.
- **RFC 6455 - WebSocket Protocol**: Standards for secure communication between clients and servers.
- **Rate Limiting in APIs**: Techniques for preventing abuse of public endpoints.

---

## Proof / Confidence

The importance of secure CORS and RPC configurations is supported by industry standards and security benchmarks. OWASP identifies CORS misconfiguration as a common API vulnerability, and numerous real-world incidents highlight the risks of unsecured Public RPC endpoints. Security tools like OWASP ZAP and Burp Suite routinely flag these issues during scans, emphasizing their prevalence and impact.
