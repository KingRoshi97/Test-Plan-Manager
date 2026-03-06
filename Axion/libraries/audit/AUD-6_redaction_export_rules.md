---
library: audit
id: AUD-6a
schema_version: 1.0.0
status: draft
---

# AUD-6a — Redaction + Export Rules

## Internal view
Internal audit logs may include:
- actor_id
- role
- target ids
- refs to internal artifacts
But still must not include secrets/tokens.

## External export
External audit export must:
- strip deny_keys
- remove internal-only refs if policy says so
- include only fields needed for traceability:
 - audit_event_id
 - action_type
 - actor.role
 - occurred_at
 - target ids
 - reason (if safe)
- preserve integrity evidence if possible:
 - root_hash / file hash
 - hash algorithm

## Retention workflow
- Active period: available for normal querying
- Archive period: read-only, slower access allowed
- End of retention: delete or purge per policy and legal requirements
