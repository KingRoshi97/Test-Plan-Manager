---
  contract_id: KL-5.3d
  schema_version: 1.0.0
  applies_to: "KL reuse gate validation"
  enforcement_level: "hard"
  ---

  # KL-5.3d — Plagiarism / Reuse Gates Validation Checklist

  - [ ] KL-GATE-06 requires reuse_log when verbatim excerpts exist
  - [ ] KL-GATE-06 blocks reuse unless use_policy==reusable_with_allowlist
  - [ ] KL-GATE-07 enforces per-KID excerpt limits (words/lines)
  - [ ] Verbatim detection definition exists (>=12 words or >=3 lines or code match)
  - [ ] Evidence format includes measurements + locations + remediation
  