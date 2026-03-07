---
library: telemetry
doc_id: TEL-2-GOV
title: Producer-Consumer Mapping
version: 1.0.0
status: draft
---

# TEL-2-GOV — Producer-Consumer Mapping

## Purpose

Establish governance rules for mapping telemetry signal producers to their consumers, ensuring traceability and preventing orphaned or unrouted signals.

## Producer Rules

- Each signal must declare exactly one `producer_library` that is responsible for emitting the signal.
- The producer library must exist in the Axion library index.
- Producers must emit signals conforming to the declared schema for that signal type.

## Consumer Rules

- Each signal must declare one or more `consumer_libraries` that ingest the signal.
- Consumers must validate incoming signals against the declared schema version.
- Consumer libraries must handle schema version mismatches gracefully (skip or transform).

## Mapping Governance

- The producer-consumer mapping is maintained in `telemetry/registries/telemetry_registry.v1.json`.
- Changes to producer or consumer assignments require a registry update with version bump.
- Removing the last consumer from a signal triggers a deprecation review.
- Adding a new consumer requires the consumer library owner to acknowledge the signal contract.

## Cross-Library Dependencies

- Telemetry signals must not create circular dependencies between libraries.
- If library A produces a signal consumed by library B, library B must not produce a signal that library A requires for its core execution path.
- Telemetry consumption is always read-only and must not affect producer behavior.
