---
library: templates
id: TMP-2
schema_version: 1.0.0
status: draft
---

# TMP-2 — Template Registry / Index

## Purpose
Provide the authoritative registry for:
- what templates exist
- where they live
- their versions and metadata
- whether they're deprecated/replaced
- selection tags (domains, stacks, risk class applicability)

## Design rule
Selection uses the registry, not directory scanning.

## Registry record must include
- template_id
- version
- path
- category/subcategory
- required_inputs
- domains/tags (for selection)
- maturity (draft/reviewed/verified/golden) (optional but recommended)
- deprecated_by (optional)
