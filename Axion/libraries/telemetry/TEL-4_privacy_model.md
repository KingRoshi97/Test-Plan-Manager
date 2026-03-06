---
library: telemetry
id: TEL-4
schema_version: 1.0.0
status: draft
---

# TEL-4 — Privacy Model (PII + Redaction)

## Purpose
Define what counts as sensitive data in telemetry and how it must be handled:
- PII (personally identifiable information)
- secrets/credentials
- proprietary content (full docs, code dumps, private business data)

## Privacy stance
Telemetry is **metadata-only by default**:
- ids, counts, timings, statuses
- hashes (optional)
- references/paths (internal only)

Never emit:
- full document content
- raw chat transcripts
- raw intake free-text (unless explicitly allowlisted and redacted)

## Data classes
### Class A — Secrets (always forbidden)
Examples:
- API keys, tokens, passwords, session cookies
- Authorization headers
- Private keys, signing secrets

### Class B — PII (forbidden unless explicitly allowlisted)
Examples:
- names, emails, phone numbers
- physical addresses
- government IDs
- biometric identifiers

### Class C — Sensitive business content (forbidden by default)
Examples:
- customer lists
- pricing sheets
- internal strategy docs
- non-public architecture diagrams in full text

### Class D — Safe operational metadata (allowed)
Examples:
- run_id, stage_id, gate_id
- durations
- counts of artifacts/proofs/templates
- success/fail status
