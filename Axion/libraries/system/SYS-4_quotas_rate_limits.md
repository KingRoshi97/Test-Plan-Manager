---
library: system
id: SYS-4
schema_version: 1.0.0
status: draft
---

# SYS-4 — Quotas + Rate Limits

## Purpose
Define deterministic limits on resource usage so Axion runs stay controllable:
- runs/day, concurrent runs
- token budgets (LLM usage)
- compute/runtime ceilings
- storage ceilings
- outbound network limits (if allowed)

Quotas are resolved from workspace → project → profile → run context.

## Definitions
- **Quota set**: a named set of limits.
- **Rate limit**: a time-based throttle (per minute/hour/day).
- **Budget**: a cap on a measured unit (tokens, minutes, MB).
- **Enforcement action**: block, warn, degrade, or require approval.

## What it governs
- quota sets used by workspaces/projects (bindings)
- profile modifiers (API vs MOBILE can have different budgets)
- deterministic enforcement decisions recorded in run manifest
