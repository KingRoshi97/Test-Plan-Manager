---
library: system
id: SYS-5a
schema_version: 1.0.0
status: draft
---

# SYS-5a — Determinism Rules (Notifications)

- Event payloads must be structured with stable fields (no freeform blobs).
- Routing evaluation is deterministic:
 - evaluate routes in file order
 - stable matching rules
 - stable destination ordering
- Throttle dedupe key must be computable from event fields only.
- Notification emission must be recorded in run logs (event_id, route_id, destination_ids).
