---
library: templates
id: TMP-6a
schema_version: 1.0.0
status: draft
---

# TMP-6a — Mapping to Pipeline Gates

## G4_TEMPLATE_SELECTION
Passes if:
- TMP-GATE-01 (registry pinned + valid)
- TMP-GATE-02 (selection artifact valid)
- TMP-GATE-03 (required inputs satisfiable)

## G5_TEMPLATE_COMPLETENESS
Passes if:
- TMP-GATE-04 (render envelopes produced)
- TMP-GATE-05 (completeness thresholds met)
- TMP-GATE-06 (citations/reuse logs correct)
