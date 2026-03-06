---
library: kit
id: KIT-0
schema_version: 1.0.0
status: draft
---

# KIT-0 — kit/ Purpose + Boundaries

## Purpose
`kit/` defines the **kit packaging contract**: the deterministic structure of the output bundle
produced in S9.
A kit is what an executor or operator consumes to build/run/deploy with minimal ambiguity.

## What it governs (in scope)
- Kit folder tree contract (what must exist, where it goes)
- Kit manifest schema (authoritative index of kit contents)
- Versioning rules (kit_version, schema versions)
- Export rules (internal vs external kit; restricted content stripping)
- Entry points (what file to start with; how to interpret the kit)

## What it does NOT govern (out of scope)
- Template content and render rules → `templates/`
- Proof ledger semantics → `verification/`
- Policy meaning and approvals → `policy/`
- Orchestration stage order/run manifest semantics → `orchestration/`

## Consumers
- Kit packaging stage (S9)
- External/internal executors (to run builds)
- Operator UI (download/export kit, inspect manifest)
- Gate evaluation (ensure kit includes required artifacts)

## Determinism requirements
- Kit contents are derived only from pinned artifacts produced during the run.
- Manifest is the single source of truth for kit contents.
- Kit tree is stable and versioned.
