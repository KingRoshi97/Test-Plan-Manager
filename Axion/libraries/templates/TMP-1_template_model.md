---
library: templates
id: TMP-1
schema_version: 1.0.0
status: draft
---

# TMP-1 — Template Model

## Purpose
Define the canonical structure of a template so it can be:
- indexed
- selected deterministically
- rendered with enforceable completeness rules

## What a template is
A template is a document skeleton with:
- stable template_id
- category + subcategory (classification)
- version
- placeholders (what must be filled)
- required inputs (which artifacts it needs)
- output contract (what it produces)
- completeness rules (what "done" means for this template)

## Template types
- doc_template (Markdown/MDX/etc.)
- schema_template (JSON/YAML skeleton)
- checklist_template (structured list)

(You can collapse to one type if you want; the important part is stable metadata + placeholders.)
