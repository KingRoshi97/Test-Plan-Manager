---
library: verification
id: VER-5
schema_version: 1.0.0
status: draft
---

# VER-5 — Verification Command Policy Model

## Purpose
Define what verification commands are allowed to run in which environments.
This prevents unsafe or non-reproducible verification.

## Inputs
- adapter_profile (capabilities, command policy id) from system/
- verification policy registry (this library)
- run profile + risk class

## Outputs
- allow/deny decision for a command run request
- recorded decision (policy decision id + reason) for audit
