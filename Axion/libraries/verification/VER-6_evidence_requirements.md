---
library: verification
id: VER-6b
schema_version: 1.0.0
status: draft
---

# VER-6b — Evidence Requirements

## Per-gate evidence requirements

### VER-GATE-01: Proof Types Valid
- proof_types registry file present and readable
- Schema validation result (pass/fail + errors)
- Pinning confirmation (registry version locked in run manifest)

### VER-GATE-02: Proof Ledger Valid
- proof_ledger file present and readable
- Schema validation result
- Proof type cross-reference check (all proof_types exist in registry)
- Append-only integrity check

### VER-GATE-03: Command Runs Tracked
- command_run_log file present and readable
- Schema validation result for log and each command_run entry
- logs_ref presence check for non-skipped runs
- Deterministic ordering verification

### VER-GATE-04: Completion Criteria Met
- completion_criteria registry loaded
- unit_done requirements evaluation (each work item has required proofs)
- run_done requirements evaluation (all gates passed, required artifacts present)
- List of missing requirements (if any)

### VER-GATE-05: Command Policy Enforced
- verification_command_policy loaded
- Each command_run checked against policy rules
- Deny violations listed (if any)
- require_approval decisions logged

### VER-GATE-06: Evidence Coverage
- For each proof in ledger: evidence_refs non-empty
- Path validity check for each evidence_ref
- Coverage ratio (proofs with valid evidence / total proofs)

### VER-GATE-07: Determinism Check
- All verification registries pinned in run manifest
- Proof ledger ordering is deterministic
- Command run log ordering is deterministic
- No artifact mutations detected
