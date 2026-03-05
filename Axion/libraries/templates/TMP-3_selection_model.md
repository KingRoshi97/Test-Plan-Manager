---
library: templates
id: TMP-3
schema_version: 1.0.0
status: draft
---

# TMP-3 — Template Selection Model

## Purpose
Define deterministic rules for selecting an ordered set of templates given:
- canonical spec signals (domains/capabilities/entities)
- standards snapshot (required artifacts, constraints)
- run profile (API/WEB/MOBILE/etc.)
- risk class
- executor type (internal/external) if relevant

## Output artifact
Selection produces TEMPLATE_SELECTION:
- ordered templates
- why each was selected (matching tags/domains/requirements)
- restrictions (risk/maturity constraints)
- any bundles used (optional)

## Design constraints
- Selection is deterministic (same inputs → same ordered list).
- Selection is explainable (each template has a reason).
- Selection is capped (avoid overload).
