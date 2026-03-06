---
library: audit
id: AUD-6
schema_version: 1.0.0
status: draft
---

# AUD-6 — Ops Workflow (Retention, Redaction, Export)

## Purpose
Define how audit data is handled operationally after it is recorded:
- how long it is retained
- what must be redacted before sharing
- how exports are packaged and approved

Audit data must remain useful for traceability without leaking sensitive information.

## Workflow surfaces
1) **Retention**
- how long audit logs are kept
- what gets archived vs deleted
- risk-class-specific retention expectations

2) **Redaction**
- what fields must never leave internal scope
- what fields can be masked or removed
- how exported audit views differ from internal audit logs

3) **Export**
- when audit logs may be exported
- who can approve export
- what export format is allowed
