---
library: telemetry
id: TEL-4a
schema_version: 1.0.0
status: draft
---

# TEL-4a — Redaction Rules

## Redaction actions (in order)
1) **Drop** forbidden keys (deep traversal)
2) **Scrub** forbidden patterns in string values
3) **Truncate** high-risk free-text fields (if allowlisted) to max length
4) **Hash** certain identifiers when required for correlation
5) **Block** event emission if payload still violates policy (external sinks)

## Key-based deny list (minimum)
Drop any key matching (case-insensitive):
- api_key, token, password, secret, authorization, cookie, session
- private_key, access_key, refresh_token, id_token
## Pattern-based deny list (minimum)
Scrub any value matching:
- bearer tokens
- key=value secrets
- PEM blocks
- JWT-like patterns

## Free-text handling
If an event payload includes any free-text field (notes, message, summary):
- internal sinks: allow only if allowlisted + truncated
- external sinks: block unless explicitly allowlisted and scrubbed

## "No content dumps"
If payload contains fields like:
- full_document
- raw_markdown
- full_code
Then:
- internal sinks: drop field
- external sinks: drop field and mark event as reduced
