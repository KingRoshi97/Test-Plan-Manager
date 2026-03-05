---
library: templates
id: TMP-1a
schema_version: 1.0.0
status: draft
---

# TMP-1a — Determinism Rules (Template Model)

- template_id is immutable; content changes require version bump.
- placeholder_id is immutable within a template version.
- required_inputs must reference known artifact contract IDs (strict mode).
- default_path is stable and used for deterministic kit packaging unless overridden by build plan.
