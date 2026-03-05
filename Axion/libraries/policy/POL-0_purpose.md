---
library: policy
id: POL-0
section: purpose
schema_version: 1.0.0
status: draft
---

# POL-0 — policy/ Purpose + Boundaries

## Purpose
`policy/` defines Axion's **global governance rules**:
- what "risk class" means (prototype vs prod vs compliance)
- what hard stops exist
- when overrides are allowed
- who can approve overrides
- how overrides expire
- how policy conflicts are resolved deterministically

This is where Axion decides when it can bend its own rules—without becoming
non-deterministic.

## What it governs (in scope)
- Risk class definitions and required thresholds (maturity floors, stricter gates)
- Override policy (who/when/why/expiry, approvals, auditability)
- Policy precedence and conflict resolution
- Policy enforcement points (which stages/gates consult policy)
- Policy sets (named bundles of policy rules bound to workspaces/projects)

## What it does NOT govern (out of scope)
- How policy is *invoked* at runtime (hook plumbing) → `system/`
- Gate DSL grammar/evaluation → `gates/`
- Stage ordering, run manifest format → `orchestration/`
- Domain-specific content rules (knowledge/templates/standards/etc.) live in those libraries

## Consumers
- Policy engine (evaluates requests from SYS hook points)
- Orchestrator (pause/stop decisions based on policy outcomes)
- Gate evaluator (override permission checks)
- Operator UI (approval workflows, policy views)

## Determinism requirements
- Policy decisions must be a pure function of:
  - pinned policy set
  - explicit request context
  - recorded identity/roles
- Overrides must be recorded with stable IDs and expiries.
