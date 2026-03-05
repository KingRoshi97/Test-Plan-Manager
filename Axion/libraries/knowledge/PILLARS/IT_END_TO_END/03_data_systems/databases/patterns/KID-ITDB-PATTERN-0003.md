---
kid: "KID-ITDB-PATTERN-0003"
title: "Outbox Pattern (reliable events)"
type: pattern
pillar: IT_END_TO_END
domains:
  - data_systems
  - databases
subdomains: []
tags:
  - databases
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Outbox Pattern (reliable events)

# Outbox Pattern (Reliable Events)

## Summary
The Outbox Pattern is a design pattern used to ensure reliable event delivery in distributed systems. It solves the problem of ensuring consistency between a transactional database and an event-driven messaging system by persisting events in an "outbox" table as part of the same database transaction. This guarantees that events are never lost or processed out of sync with the database state.

---

## When to Use
- When you need to ensure reliable event delivery in distributed systems.
- When your application uses both a transactional database and an event-driven messaging system (e.g., Kafka, RabbitMQ).
- When eventual consistency between services is acceptable, but data loss or duplication is not.
- When you need to decouple the write operations to the database from event publishing.
- When your system must handle retries or failures gracefully without compromising data integrity.

---

## Do / Don't

### Do:
1. **Use the Outbox Pattern for critical business workflows** where data consistency and event reliability are essential.
2. **Ensure the outbox table resides in the same database** as the transactional data to guarantee atomicity.
3. **Implement idempotent event consumers** to handle duplicate event deliveries gracefully.
4. **Use a background process or message relay** to read from the outbox table and publish events to the messaging system.
5. **Monitor and alert on the outbox table size** to detect potential issues with the relay process.

### Don't:
1. **Don't bypass the outbox table** by publishing events directly to the message broker within the same transaction.
2. **Don't use the Outbox Pattern when strict real-time event delivery is required**, as it introduces a delay due to the relay process.
3. **Don't neglect error handling or retries** in the relay process; failed event publishing must be retried to avoid data loss.
4. **Don't use the Outbox Pattern for non-critical events** where occasional data loss is acceptable.
5. **Don't assume the outbox table will clean itself up**; implement a cleanup strategy for old or processed events.

---

## Core Content

### Problem
In distributed systems, ensuring consistency between a transactional database and an event-driven messaging system is challenging. Without a proper mechanism, events might be published to the messaging system but fail to be committed to the database, or vice versa. This can lead to data loss, inconsistent states, or duplicate events.

### Solution
The Outbox Pattern addresses this problem by introducing an intermediate "outbox" table in the transactional database. Events are written to this table as part of the same transaction that modifies the database state. A separate process then reads from the outbox table and publishes the events to the messaging system.

### Implementation Steps
1. **Create the Outbox Table**  
   Define an outbox table in your database. Include fields such as:
   - `id` (unique identifier)
   - `event_type` (type of the event)
   - `payload` (event data, typically JSON)
   - `created_at` (timestamp of event creation)
   - `processed` (boolean or timestamp indicating whether the event has been published)

2. **Write to the Outbox Table in the Same Transaction**  
   When performing a database operation that requires an event to be published, insert a corresponding record into the outbox table within the same transaction. This ensures atomicity.

3. **Implement a Relay Process**  
   Create a background process or service that periodically reads unprocessed events from the outbox table, publishes them to the messaging system, and marks them as processed. Use a reliable mechanism to ensure events are not lost during this process.

4. **Handle Failures and Retries**  
   If event publishing fails, the relay process should retry. Use exponential backoff or a similar strategy to avoid overloading the system.

5. **Ensure Idempotency**  
   Design event consumers to handle duplicate events gracefully. This is critical because the relay process may retry publishing, leading to multiple deliveries of the same event.

6. **Monitor and Clean Up**  
   Monitor the size of the outbox table to detect issues with the relay process. Implement a cleanup mechanism to remove old or processed events to prevent unbounded growth.

### Example
Suppose you have an e-commerce application where orders are stored in a `orders` table, and you need to publish an `OrderCreated` event to a Kafka topic. When inserting a new order into the `orders` table, also insert a record into the `outbox` table with the event details. A background service reads from the outbox table, publishes the event to Kafka, and updates the `processed` field for the event.

---

## Links
- **Event Sourcing**: A related pattern for capturing all changes to application state as a sequence of events.
- **Transactional Outbox in Kafka**: Best practices for implementing the Outbox Pattern with Kafka.
- **Idempotent Consumers**: Techniques for designing consumers that handle duplicate events.
- **Distributed Systems Consistency Models**: Overview of eventual consistency and its tradeoffs.

---

## Proof / Confidence
The Outbox Pattern is a widely adopted industry standard for ensuring reliable event delivery in distributed systems. It is recommended by leading technology companies, including Netflix and Uber, and is supported by frameworks like Debezium for change data capture. The pattern aligns with the CAP theorem by enabling eventual consistency while maintaining availability and partition tolerance.
