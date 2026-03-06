---
library: kit
id: KIT-1
schema_version: 1.0.0
status: draft
---

# KIT-1 — Kit Folder Tree Model

## Purpose
Define a deterministic folder structure for packaged outputs so executors and operators always
know where to look.

## Core idea
- The kit tree is stable across runs (only contents vary).
- Every file in the kit must be listed in KIT_MANIFEST.
- No "mystery files" and no directory scanning required.

## Minimum kit top-level structure
- kit_manifest.json (authoritative index)
- README.md (entry guidance)
- artifacts/ (pinned artifacts: canonical, standards, plans, proofs)
- docs/ (rendered templates)
- scripts/ (verification/run scripts, optional)
- metadata/ (run manifest snapshot, pins, environment notes)
