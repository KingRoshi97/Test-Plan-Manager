---
library: templates
id: TMP-5
schema_version: 1.0.0
status: draft
---

# TMP-5 — Template Completeness Model

## Purpose
Define what it means for a rendered template to be "complete" so
G5_TEMPLATE_COMPLETENESS can be enforced.

## Completeness dimensions
1) **Placeholder completeness**
- all required placeholders are filled
- optional placeholders may be left empty but should be flagged

2) **Section completeness**
- required sections exist (headings/blocks)
- required sections are non-empty

3) **Policy constraints**
- if risk class is PROD/COMPLIANCE, completeness thresholds are stricter

## Outputs
Completeness should be recorded in each render envelope:
- placeholders_total
- placeholders_filled
- missing_required_placeholder_ids
