---
library: verification
id: VER-4a
schema_version: 1.0.0
status: draft
---

# VER-4a — Determinism Rules (Completion)

- Completion evaluation reads only pinned artifacts:
  - acceptance_map, proof_ledger, gate_report(s), run_manifest
- Manual decisions must be represented as manual_attestation proofs (no implicit judgment).
- The criteria registry is pinned per run.
- Missing requirements lists are deterministically ordered.
