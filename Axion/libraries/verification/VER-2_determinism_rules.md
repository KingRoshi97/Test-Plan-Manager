---
library: verification
id: VER-2a
schema_version: 1.0.0
status: draft
---

# VER-2a — Determinism Rules (Proof Ledger)

- Proof ledger is append-only; no deletions or mutations within a run.
- proof_type must match an entry in the pinned proof_types registry.
- evidence_refs use stable paths; content is not embedded.
- Proofs are ordered deterministically in the ledger by recorded_at then proof_id.
- Ledger validation is run against the proof_ledger schema before gate evaluation.
