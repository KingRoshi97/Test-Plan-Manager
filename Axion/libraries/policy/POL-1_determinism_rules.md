---
library: policy
id: POL-1a
section: determinism_rules
schema_version: 1.0.0
status: draft
---

# POL-1a — Determinism Rules (Risk Class)

- risk_class is a closed enum (PROTOTYPE/PROD/COMPLIANCE).
- Threshold fields are enums, not free text.
- Risk class selection must be recorded in the run manifest at run start.
- Any changes to risk class definitions require a registry version bump.
