---
kid: "KID-ITNET-REF-0002"
title: "HTTP Status Codes Reference (operational meaning)"
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
  - "reference"
legacy_path: "PILLARS/IT_END_TO_END/01_foundations/networking/references/KID-ITNET-REF-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion-system"
---

# HTTP Status Codes Reference (operational meaning)

```markdown
# HTTP Status Codes Reference (Operational Meaning)

## Summary
HTTP status codes are standardized responses issued by a server to indicate the outcome of a client’s request. These codes are grouped into five classes: informational (1xx), success (2xx), redirection (3xx), client error (4xx), and server error (5xx). Understanding these codes is essential for diagnosing and resolving issues in web applications and APIs.

## When to Use
- Troubleshooting failed HTTP requests in web applications or APIs.
- Configuring server responses for specific client behaviors (e.g., redirects, authentication).
- Monitoring and logging server health and performance via HTTP response codes.
- Validating API responses in automated testing or debugging.

## Do / Don't

### Do
- **Use 200 (OK)** for successful GET requests where the response contains the requested resource.
- **Return 404 (Not Found)** when a requested resource does not exist on the server.
- **Use 301 (Moved Permanently)** or 302 (Found) for URL redirection when resources are moved.

### Don't
- **Don't use 500 (Internal Server Error)** as a generic fallback for all server-side issues; log and diagnose specific problems.
- **Don't return 200 (OK)** for error responses (e.g., validation errors); use 4xx codes instead.
- **Don't expose sensitive information in error messages sent with 4xx or 5xx status codes.

## Core Content

### HTTP Status Code Classes and Common Codes

| Class | Code | Name                     | Operational Meaning                                                                 |
|-------|------|--------------------------|-------------------------------------------------------------------------------------|
| 1xx   | 100  | Continue                 | The server has received the request headers and the client should proceed to send the body. |
|       | 101  | Switching Protocols      | The server is switching protocols as requested by the client.                      |
| 2xx   | 200  | OK                       | The request was successful, and the response contains the requested resource.       |
|       | 201  | Created                  | The request was successful, and a new resource was created.                        |
| 3xx   | 301  | Moved Permanently        | The requested resource has been permanently moved to a new URL.                    |
|       | 302  | Found                    | The requested resource is temporarily located at a different URL.                  |
| 4xx   | 400  | Bad Request              | The server could not understand the request due to invalid syntax.                 |
|       | 401  | Unauthorized             | Authentication is required and has failed or not been provided.                    |
|       | 403  | Forbidden                | The client does not have permission to access the requested resource.              |
|       | 404  | Not Found                | The requested resource could not be found on the server.                           |
| 5xx   | 500  | Internal Server Error    | The server encountered an unexpected condition that prevented it from fulfilling the request. |
|       | 503  | Service Unavailable      | The server is temporarily unable to handle the request due to maintenance or overload. |

### Key Parameters and Configuration Options
- **Custom Error Pages**: Configure web servers (e.g., Apache, Nginx) to display custom error pages for 4xx and 5xx responses.
- **Retry-After Header**: For 503 (Service Unavailable), include the `Retry-After` header to inform clients when to retry.
- **Caching Directives**: Use HTTP headers like `Cache-Control` with 3xx codes to manage caching behavior for redirects.

### Practical Use Cases
1. **API Development**: Use 201 (Created) when a POST request successfully creates a new resource.
2. **Load Balancing**: Return 503 (Service Unavailable) during server maintenance to signal clients to retry later.
3. **SEO Optimization**: Use 301 (Moved Permanently) for URL changes to preserve search engine rankings.

## Links
- **RFC 9110**: HTTP Semantics and Content guidelines from the IETF.
- **RESTful API Design**: Best practices for using HTTP status codes in APIs.
- **HTTP Headers Reference**: Comprehensive guide to HTTP headers and their usage.
- **Web Server Configuration**: Documentation for configuring HTTP status codes in Apache and Nginx.

## Proof / Confidence
This reference is based on **RFC 9110**, the authoritative standard for HTTP semantics, and widely adopted practices in web development and API design. Industry benchmarks, such as RESTful API design guidelines, confirm the operational meanings and best practices for HTTP status codes.
```
