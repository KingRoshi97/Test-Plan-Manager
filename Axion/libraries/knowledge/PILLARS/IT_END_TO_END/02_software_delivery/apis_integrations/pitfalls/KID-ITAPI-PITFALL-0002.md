---
kid: "KID-ITAPI-PITFALL-0002"
title: "Unbounded list endpoints (DoS risk)"
type: pitfall
pillar: IT_END_TO_END
domains:
  - software_delivery
  - apis_integrations
subdomains: []
tags: [api, dos, pagination]
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

# Unbounded list endpoints (DoS risk)

# Unbounded List Endpoints (DoS Risk)

## Summary

Unbounded list endpoints are API endpoints that return data without enforcing limits on the number of records retrieved. This design flaw can lead to Denial of Service (DoS) vulnerabilities, as malicious or unintentional large queries can overwhelm system resources. Developers often overlook this issue during implementation, prioritizing functionality over scalability and security. Proper pagination, rate limiting, and validation are essential to mitigate this risk.

---

## When to Use

This pitfall applies to scenarios where:

- APIs expose data retrieval endpoints, such as `/users`, `/orders`, or `/logs`.
- The API is expected to handle large datasets or unpredictable query volumes.
- External clients or third-party integrations consume the API.
- The system has performance or availability requirements that could be impacted by resource exhaustion.

---

## Do / Don't

### Do:
- **Implement pagination**: Always enforce limits (e.g., `limit` and `offset` parameters) on list endpoints.
- **Set reasonable defaults and maximum limits**: Define a sensible default page size (e.g., 50 or 100 records) and a hard upper limit to prevent abuse.
- **Monitor and log usage patterns**: Track API usage to identify abnormal behavior or misuse.

### Don't:
- **Allow unbounded queries**: Avoid returning all records without constraints, even for internal APIs.
- **Trust client-provided parameters blindly**: Validate and sanitize `limit` and `offset` values to prevent excessive queries.
- **Ignore rate limiting**: Failing to enforce request limits can amplify the impact of unbounded queries.

---

## Core Content

Unbounded list endpoints are a common pitfall in API design. They occur when an API allows clients to query and retrieve an unrestricted number of records in a single request. For example, an endpoint like `/users` that returns all user records without pagination can inadvertently expose the system to resource exhaustion.

### Why This Happens
Developers often prioritize ease of use or rapid development over scalability and security. They may assume that clients will use the API responsibly or that the dataset will remain small. However, these assumptions rarely hold in production environments, especially as datasets grow or when APIs are exposed to external clients.

### Consequences
Unbounded list endpoints can lead to:
1. **Denial of Service (DoS)**: Large queries can consume excessive memory, CPU, or database resources, causing system slowdowns or crashes.
2. **Data leakage**: Exposing all records in a single response increases the risk of data breaches, especially if sensitive information is included.
3. **Poor performance**: Even legitimate clients may experience degraded performance if the API struggles to handle large responses.

### How to Detect It
- **Code review**: Look for endpoints that do not enforce pagination or limits.
- **Load testing**: Simulate large queries to observe system behavior under stress.
- **Monitoring**: Use application performance monitoring (APM) tools to identify endpoints with high response sizes or long processing times.

### How to Fix or Avoid It
1. **Enforce Pagination**: Require clients to specify pagination parameters (`limit` and `offset`) and enforce reasonable defaults. For example:
   ```json
   GET /users?limit=50&offset=0
   ```
2. **Set Maximum Limits**: Define an upper bound for `limit` to prevent excessive queries. For instance, restrict `limit` to a maximum of 1000 records.
3. **Rate Limiting**: Implement rate limiting to restrict the frequency of requests from a single client. This prevents abuse and mitigates DoS risks.
4. **Validation and Error Handling**: Validate client-provided parameters and return appropriate error messages for invalid or excessive values.
5. **Cursor-Based Pagination**: For APIs dealing with large datasets, consider using cursor-based pagination instead of offset-based pagination for better performance.

### Real-World Scenario
A retail company exposed an unbounded `/orders` endpoint to its partners for retrieving order data. During a partner's integration testing, a query inadvertently requested all orders, overwhelming the database and causing downtime for the entire system. The issue was resolved by implementing pagination with a default limit of 100 records per request and a maximum limit of 500 records.

---

## Links

- **OWASP API Security Top 10**: Guidance on API security risks, including excessive data exposure.
- **REST API Design Best Practices**: Recommendations for designing scalable and secure APIs.
- **Rate Limiting Strategies**: Techniques for implementing rate limiting in distributed systems.
- **Cursor vs. Offset Pagination**: A comparison of pagination strategies and their trade-offs.

---

## Proof / Confidence

This content is supported by industry standards such as the **OWASP API Security Top 10**, which highlights excessive data exposure as a common risk. Best practices for REST API design consistently recommend pagination and rate limiting to prevent performance and security issues. Real-world incidents, such as high-profile outages caused by unbounded queries, further underscore the importance of addressing this pitfall.
