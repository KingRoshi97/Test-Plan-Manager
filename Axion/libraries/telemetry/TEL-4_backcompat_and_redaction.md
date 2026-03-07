---
library: telemetry
doc_id: TEL-4-GOV
title: Backward Compatibility and Redaction
version: 1.0.0
status: draft
---

# TEL-4-GOV — Backward Compatibility and Redaction

## Purpose

Define governance rules for maintaining backward compatibility of telemetry signals and enforcing redaction policies to protect sensitive data in telemetry payloads.

## Backward Compatibility Rules

- Schema changes to active signals must be backward-compatible (additive only).
- Removing a required field from an active signal schema is a breaking change and requires a new schema version.
- Renaming fields is treated as a remove-and-add operation (breaking).
- Consumers must support at least the current and one prior schema version.
- Deprecated schema versions must remain valid for a minimum of two release cycles.

## Versioning Protocol

- Signal schemas follow semantic versioning: `major.minor.patch`.
- Patch: documentation or description changes only.
- Minor: additive field additions, new optional properties.
- Major: breaking changes (field removal, type changes, required field additions).

## Redaction Rules

- Telemetry payloads must never contain secrets, API keys, or authentication tokens.
- PII fields must be redacted or hashed before emission.
- Full document content must not appear in telemetry payloads; use document references or content hashes.
- Redaction is enforced at the producer side before signal emission.

## Redaction Verification

- Telemetry schemas should declare fields subject to redaction via a `redact` annotation.
- Automated checks must verify that redactable fields are processed before delivery to external sinks.
- Redaction failures must be logged and the signal must be dropped rather than delivered un-redacted.

## Audit Trail

- All schema version transitions must be recorded in the telemetry registry with effective dates.
- Redaction policy changes must be versioned alongside the signal schema.
