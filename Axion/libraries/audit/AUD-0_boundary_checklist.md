---
library: audit
id: AUD-0a
schema_version: 1.0.0
status: draft
---

# AUD-0a — Boundary Checklist

Belongs in `audit/` if it answers:
- "What operator actions are recorded?"
- "How do we prove who approved/overrode something?"
- "How do we link actions to runs/stages/gates/policies?"

Does NOT belong in `audit/` if it answers:
- "What telemetry do we emit?" (telemetry)
- "What proofs exist?" (verification)
