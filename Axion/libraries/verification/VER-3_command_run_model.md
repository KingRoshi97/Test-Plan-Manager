---
library: verification
id: VER-3
schema_version: 1.0.0
status: draft
---

# VER-3 — Command Run Tracking Model

## Purpose
Track execution of verification commands in a structured way so proofs can reference:
- what command ran
- in what environment (adapter profile)
- what the result was (exit code/status)
- where logs/output artifacts live

This enables reproducibility, auditing, and evidence collection without dumping logs into gate reports.

## Key properties
- command runs are run-scoped
- logs are referenced, not embedded
- results are minimal but sufficient for proof generation
