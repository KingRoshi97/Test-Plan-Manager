---
library: telemetry
id: TEL-2a
schema_version: 1.0.0
status: draft
---

# TEL-2a — Determinism Rules (Metrics)

- Metrics are derived from pinned run artifacts:
  - run manifest timestamps
  - stage reports
  - gate reports
  - proof ledger counts
  - template selection counts
- Ordering:
  - stages sorted by stage order (or stage_id lexicographic if unavailable)
  - gates sorted by gate order (or gate_id lexicographic)
- Optional token/cost metrics must specify their source (adapter/runtime) if present.
