---
kid: "KID-ITAPI-REF-0001"
title: "HTTP Method Semantics Reference"
type: reference
pillar: IT_END_TO_END
domains:
  - software_delivery
  - apis_integrations
subdomains: []
tags: [api, http, methods, semantics]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
supersedes: ""
deprecated_by: ""
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# HTTP Method Semantics Reference

# HTTP Method Semantics Reference

## Summary
HTTP methods define the actions that can be performed on resources in a RESTful API. Each method has specific semantics and intended use cases, which are critical for building reliable, predictable, and standards-compliant APIs. This reference outlines the key HTTP methods, their purposes, and best practices for their usage in software delivery and API integrations.

## When to Use
- Use HTTP methods to define the intent of API requests (e.g., retrieving, creating, updating, or deleting resources).
- Apply these methods in RESTful API design to ensure clarity and adherence to HTTP standards.
- Use the appropriate method to align with the idempotency and safety requirements of the operation.

## Do / Don't

### Do:
1. **Use `GET` for retrieving data** without causing side effects on the server.
2. **Use `POST` for creating resources** or performing actions that change server state.
3. **Ensure idempotency for `PUT` and `DELETE` methods** to align with HTTP specifications.

### Don't:
1. **Don't use `GET` for operations that modify server state** (e.g., creating or updating resources).
2. **Don't use `POST` when `PUT` or `PATCH` is more appropriate** for updating resources.
3. **Don't ignore HTTP response codes**; always return appropriate status codes for the method used.

## Core Content

### HTTP Methods Overview

| Method   | Description                                                                 | Idempotent | Safe  |
|----------|-----------------------------------------------------------------------------|------------|-------|
| `GET`    | Retrieve a representation of a resource.                                   | Yes        | Yes   |
| `POST`   | Submit data to create a resource or trigger a server-side process.         | No         | No    |
| `PUT`    | Replace an existing resource or create one if it doesn’t exist.            | Yes        | No    |
| `PATCH`  | Partially update an existing resource.                                     | No         | No    |
| `DELETE` | Remove a resource.                                                         | Yes        | No    |
| `HEAD`   | Retrieve headers for a resource without the body.                          | Yes        | Yes   |
| `OPTIONS`| Describe the communication options for a resource.                         | Yes        | Yes   |
| `TRACE`  | Echo the received request for debugging purposes.                          | Yes        | No    |

### Key Parameters and Headers
- **`Content-Type`**: Specifies the media type of the request body (e.g., `application/json`).
- **`Accept`**: Indicates the media types the client can process in the response.
- **`Authorization`**: Used for authentication (e.g., `Bearer <token>`).
- **`If-Match` / `If-None-Match`**: Used with `PUT` or `DELETE` for conditional requests based on ETags.
- **`If-Modified-Since` / `If-Unmodified-Since`**: Used with `GET` or `HEAD` for conditional requests based on timestamps.

### Configuration Options
- **Timeouts**: Configure client and server timeouts to ensure requests do not hang indefinitely.
- **CORS**: Use `OPTIONS` for preflight requests when implementing Cross-Origin Resource Sharing.
- **Rate Limiting**: Use headers like `X-RateLimit-Limit` and `X-RateLimit-Remaining` to communicate API usage limits.

### Common Use Cases
1. **`GET`**: Fetching user details, product listings, or search results.
2. **`POST`**: Submitting forms, creating user accounts, or initiating workflows.
3. **`PUT`**: Updating a user profile or replacing a configuration file.
4. **`DELETE`**: Removing outdated records or deactivating user accounts.
5. **`PATCH`**: Updating specific fields in a resource, such as changing a user’s email address.

## Links
- **RFC 7231**: Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content.
- **RESTful API Design Principles**: Best practices for designing REST APIs.
- **HTTP Status Code Reference**: Comprehensive guide to HTTP response codes.
- **CORS Specification**: Cross-Origin Resource Sharing standard.

## Proof / Confidence
This content is based on the HTTP/1.1 specification (RFC 7231) and widely accepted RESTful API design principles. These standards are supported by industry benchmarks and best practices from leading organizations, including W3C and IETF. Adhering to these guidelines ensures compatibility, scalability, and maintainability in software delivery and API integrations.
