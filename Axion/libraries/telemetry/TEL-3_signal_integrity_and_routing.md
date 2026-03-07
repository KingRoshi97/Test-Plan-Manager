---
library: telemetry
doc_id: TEL-3-GOV
title: Signal Integrity and Routing
version: 1.0.0
status: draft
---

# TEL-3-GOV — Signal Integrity and Routing

## Purpose

Define integrity guarantees and routing rules for telemetry signals as they flow from producers to consumers through the telemetry subsystem.

## Integrity Guarantees

- Every emitted signal must include a valid `signal_id`, `timestamp`, and `schema_version`.
- Signals must be immutable after emission — no in-flight mutation by intermediaries.
- Signal payloads must conform to the declared schema at the time of emission.
- Schema version mismatches between producer and consumer must be logged as integrity warnings.

## Routing Rules

- Signals are routed based on `signal_type` and the producer-consumer mapping in the registry.
- Event signals are delivered to all declared consumers.
- Metric signals may be aggregated before delivery if the consumer declares aggregation support.
- Decision signals must be delivered intact without aggregation or sampling.

## Delivery Semantics

- Telemetry delivery is best-effort; signal loss must not halt pipeline execution.
- Consumers must tolerate out-of-order delivery.
- Duplicate signals (same `signal_id`) must be deduplicated by the consumer.

## Routing Failures

- Unroutable signals (no matching consumer) are logged to the telemetry dead-letter sink.
- Routing failures do not propagate errors to the producing library.
- Dead-letter signals are retained for a configurable retention period for debugging.

## Sink Policy Integration

- All routing must respect the sink policies defined in TEL-3 (Sink Policy Model).
- Signals destined for external sinks must pass through redaction filters before delivery.
