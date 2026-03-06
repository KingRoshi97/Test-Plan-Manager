---
library: verification
id: VER-3a
schema_version: 1.0.0
status: draft
---
# VER-3a — Determinism Rules (Command Runs)

- command_run_id is generated deterministically per (run_id + command + cwd + started_at bucket) OR generated sequentially but recorded.
- command strings must be exact (no hidden expansions) and stored verbatim.
- logs refs are stable paths; content is not embedded.
- command runs are ordered deterministically in command_run_log for serialization:
  - started_at
  - command_run_id
