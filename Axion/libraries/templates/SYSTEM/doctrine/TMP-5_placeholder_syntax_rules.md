---
library: templates
id: TMP-5a
schema_version: 1.0.0
status: draft
---

# TMP-5a — Placeholder Syntax Rules

## Allowed placeholder forms (minimum)
Placeholders must use a consistent syntax so they can be detected reliably.

### Inline placeholder
- `{{PH:PH-<ID>}}`

### Block placeholder
- Start: `<!-- PH:PH-<ID> START -->`
- End: `<!-- PH:PH-<ID> END -->`

## Filled vs unfilled
- Unfilled placeholders must remain exactly as placeholder syntax.
- Filled placeholders must not contain placeholder markers.
- "TBD" counts as unfilled unless explicitly allowed.

## Forbidden
- Nested placeholders
- Dynamic/templating logic in templates
- Arbitrary code execution
