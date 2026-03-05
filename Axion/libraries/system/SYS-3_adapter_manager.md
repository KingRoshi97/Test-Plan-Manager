---
library: system
id: SYS-3
schema_version: 1.0.0
status: draft
---

# SYS-3 — Adapter Manager (Capability Discovery)

## Purpose
Adapters define **where** a run executes (local, Replit, CI, etc.) and **what it is allowed to do**
there. The adapter manager provides deterministic capability discovery so agents can't assume
tools that don't exist.

## Definitions
- **Adapter**: an execution environment integration (Local, Replit, GitHub Actions, etc.)
- **Capability**: a declared, auditable ability (run commands, write files, access network, run
tests, etc.)
- **Adapter profile**: a named bundle of capabilities used for pinning and enforcement

## What it governs
- Capability declarations (what exists)
- Capability requirements per run profile (API/Web/Mobile/etc.)
- Command policy boundaries (what commands are allowed)
- Environmental constraints (no network, limited ports, sandbox rules)

## What it does NOT govern
- The content of verification commands (that's `verification/`)
- Stage order/IO (that's `orchestration/`)
- Risk class policies (that's `policy/`)
