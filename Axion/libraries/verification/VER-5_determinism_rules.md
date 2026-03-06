---
library: verification
id: VER-5a
schema_version: 1.0.0
status: draft
---

# VER-5a — Determinism Rules (Command Policy)

- Rules are evaluated in file order; first match wins.
- Command string is matched verbatim (no shell expansion assumed).
- Policy is pinned per run.
- require_approval outcome triggers policy hook and audit record.
