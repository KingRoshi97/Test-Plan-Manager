---
library: canonical
id: CAN-4a
schema_version: 1.0.0
status: draft
---

# CAN-4a — Unknown/Assumption Rules

## Default behavior
- If required information is missing → create an **unknown**.
- If the system chooses a default to proceed → create an **assumption**.

## Blocking severity
Mark as severity=blocking when:
- it affects security boundaries (auth, access control)
- it affects data integrity (schema, migration, money)
- it affects compliance classification (PII/PHI/payment)
- it affects external integrations (webhooks, payment processors)

## Non-blocking severity
Mark as low/medium when:
- it affects naming, styling, or optional features
- it affects non-critical performance defaults

## No hidden assumptions
Every builder default used must be captured as an assumption item (even if low severity).
