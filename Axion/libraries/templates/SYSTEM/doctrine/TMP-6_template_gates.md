---
library: templates
id: TMP-6
schema_version: 1.0.0
status: draft
---

# TMP-6 — Template Gates

## Purpose
Ensure templates are selected and rendered deterministically and completely.

## Gate set (minimum)

### TMP-GATE-01 — Template registry pinned + valid
- template_registry is pinned
- registry validates against template_registry.v1

### TMP-GATE-02 — Template selection artifact valid
- TEMPLATE_SELECTION exists
- validates against template_selection.v1
- selected templates exist in registry (template_id/version/path)

### TMP-GATE-03 — Required inputs satisfiable
For each selected template:
- required_inputs are present in run manifest artifacts (CANONICAL_SPEC,
STANDARDS_SNAPSHOT, etc.)

### TMP-GATE-04 — Render envelopes produced
- For each selected template output:
  - a render_envelope exists and validates against render_envelope.v1
  - envelope.template_ref matches the selected template version

### TMP-GATE-05 — Completeness threshold met (risk-based)
- completeness computed per TMP-5 rules
- required_placeholders_min_pct threshold met per risk_class
- missing required sections/placeholders fail under PROD/COMPLIANCE

### TMP-GATE-06 — Knowledge citations emitted when used
- If knowledge_selection_ref present or knowledge was used:
  - envelope.knowledge_citations must include KID IDs
  - if allowlisted reuse occurred → reuse_log_refs present

## Pipeline gate mapping
- G4_TEMPLATE_SELECTION corresponds primarily to TMP-GATE-01..03
- G5_TEMPLATE_COMPLETENESS corresponds primarily to TMP-GATE-04..06
