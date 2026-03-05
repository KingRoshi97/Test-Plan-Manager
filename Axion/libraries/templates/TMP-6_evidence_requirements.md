---
library: templates
id: TMP-6c
schema_version: 1.0.0
status: draft
---

# TMP-6c — Evidence Requirements (Template Failures)

On failure, evidence must include:
- template_id + version
- pointer to registry entry
- pointer to TEMPLATE_SELECTION entry + reason
- missing required inputs (contract_ids) if TMP-GATE-03 fails
- pointer to render_envelope and missing fields if TMP-GATE-04 fails
- missing placeholder IDs and computed pct if TMP-GATE-05 fails
- missing KID citations / reuse logs if TMP-GATE-06 fails
