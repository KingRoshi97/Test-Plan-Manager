---
kid: "KID-ITAPI-PATTERN-0002"
title: "Idempotent Write Pattern"
content_type: "pattern"
primary_domain: "software_delivery"
secondary_domains:
  - "apis_integrations"
industry_refs: []
stack_family_refs: []
pillar_refs:
  - "solution_patterns"
status: "active"
authority_tier: "reviewed"
bundle_refs: []
tags:
  - "["
  - "a"
  - "p"
  - "i"
  - ","
  - " "
  - "i"
  - "d"
  - "e"
  - "m"
  - "p"
  - "o"
  - "t"
  - "e"
  - "n"
  - "c"
  - "y"
  - ","
  - " "
  - "w"
  - "r"
  - "i"
  - "t"
  - "e"
  - "s"
  - "]"
legacy_path: "PILLARS/IT_END_TO_END/02_software_delivery/apis_integrations/patterns/KID-ITAPI-PATTERN-0002.md"
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: "axion"
---

# Idempotent Write Pattern

# Idempotent Write Pattern

## Summary
The Idempotent Write Pattern ensures that repeated execution of a write operation produces the same result, regardless of how many times it is invoked. This pattern is essential for building reliable APIs and integrations in distributed systems where retries or duplicate requests are common due to network failures or client-side issues.

## When to Use
- When designing APIs or services that must handle retries gracefully (e.g., HTTP POST requests in REST APIs).
- In distributed systems where duplicate messages or requests may occur due to eventual consistency or message delivery guarantees.
- When integrating third-party systems that may inadvertently send duplicate requests.
- In workflows requiring transactional consistency to prevent unintended side effects from repeated operations.

## Do / Don't

### Do
1. **Use unique identifiers**: Include a client-generated unique identifier (e.g., `idempotency_key`) in write requests to track and prevent duplicate processing.
2. **Persist state**: Store the results of processed requests, along with their unique identifiers, to ensure consistent responses for retries.
3. **Validate input rigorously**: Ensure the input data associated with the idempotency key is consistent across retries to avoid ambiguity.
4. **Design for statelessness**: Implement the pattern in a stateless manner where possible, relying on external storage for tracking state.
5. **Test for concurrency**: Simulate scenarios where multiple identical requests arrive simultaneously to ensure the system handles them correctly.

### Don't
1. **Assume retries won't happen**: Network instability or client-side issues can lead to duplicate requests; design for these scenarios.
2. **Ignore state persistence**: Failing to persist the state associated with idempotent operations can lead to inconsistent results.
3. **Use mutable keys**: Avoid using request parameters that can change across retries as idempotency keys.
4. **Rely solely on timestamps**: Timestamps can lead to collisions or inconsistencies in distributed systems; prefer unique identifiers.
5. **Implement idempotency in isolation**: Ensure the pattern aligns with other reliability patterns, such as retry mechanisms and circuit breakers.

## Core Content
### Problem
In distributed systems, network failures, client retries, or duplicate requests can result in unintended side effects, such as duplicate database entries, overcharging customers, or inconsistent state. Without safeguards, repeated write operations can compromise data integrity and lead to unpredictable system behavior.

### Solution Approach
The Idempotent Write Pattern solves this problem by ensuring that repeated execution of a write operation produces the same result. The key is to identify each write request uniquely and persist the state associated with the operation.

### Implementation Steps
1. **Generate a unique identifier**: Require clients to include a unique `idempotency_key` in write requests. This key should be immutable and unique for each logical operation.
   - Example: For a payment API, the client could generate an `idempotency_key` based on the payment transaction ID.
   
2. **Store request state**: Persist the `idempotency_key` and the associated request data in a durable storage system (e.g., database, distributed cache).
   - Example: Use a database table with columns for `idempotency_key`, request payload, and response payload.

3. **Check for duplicates**: Before processing a write request, check if the `idempotency_key` already exists in storage.
   - If it exists, return the previously stored response.
   - If it does not exist, proceed with processing the request.

4. **Ensure atomicity**: Implement atomic operations to store the `idempotency_key` and process the request to avoid race conditions.
   - Example: Use database transactions or conditional updates (`INSERT IF NOT EXISTS`).

5. **Return consistent responses**: Ensure the response for a duplicate request matches the original response to maintain consistency.
   - Example: For a payment API, if a duplicate request is detected, return the original payment confirmation details.

6. **Handle concurrency**: Use locks or optimistic concurrency control to prevent race conditions when multiple identical requests arrive simultaneously.

### Example
```python
def process_request(idempotency_key, request_data):
    # Check if the idempotency key exists
    existing_record = database.get(idempotency_key)
    if existing_record:
        return existing_record["response"]

    # Process the request and store the result atomically
    response = perform_write_operation(request_data)
    database.insert_if_not_exists(idempotency_key, request_data, response)

    return response
```

### Tradeoffs
- **Storage overhead**: Persisting idempotency keys and associated state increases storage requirements.
- **Complexity**: Implementing atomic operations and handling concurrency adds complexity to the system.
- **Client responsibility**: Clients must generate and manage unique idempotency keys, which may require additional effort.

### Alternatives
- **Deduplication at the transport layer**: Use message brokers or middleware that automatically deduplicates requests, such as Kafka or RabbitMQ.
- **Transactional APIs**: Design APIs to support transactional operations that roll back unintended side effects.

## Links
- **REST API Design Principles**: Guidelines for building reliable REST APIs, including idempotency considerations.
- **Distributed Systems Patterns**: Overview of patterns for handling retries, deduplication, and eventual consistency.
- **Atomicity in Databases**: Explanation of atomic operations and their importance in ensuring consistency.

## Proof / Confidence
The Idempotent Write Pattern is widely adopted in industry standards for API design, including Stripe, PayPal, and AWS. It is recommended in the HTTP specification for safe operations and is a foundational practice for reliability in distributed systems.
