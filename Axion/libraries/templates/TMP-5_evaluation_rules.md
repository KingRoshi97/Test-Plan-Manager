---
library: templates
id: TMP-5b
schema_version: 1.0.0
status: draft
---

# TMP-5b — Completeness Evaluation Rules

## Inputs
- template_definition.placeholders + completeness requirements
- rendered output content
- render_envelope.completeness fields
- risk_class (from policy)

## Rules (minimum)
1) Count required placeholders (required == true).
2) Determine filled required placeholders:
  - placeholder marker no longer present AND content non-empty
  - if content is "TBD"/"TODO" and allow_tbd == false → not filled
3) Compute pct = filled_required / total_required * 100
4) Compare pct to threshold required_placeholders_min_pct for risk_class.
5) Missing required sections cause failure regardless of pct (if template defines
required_sections).

## Output
- Update envelope.completeness:
  - placeholders_total
  - placeholders_filled
  - missing_required_placeholder_ids
