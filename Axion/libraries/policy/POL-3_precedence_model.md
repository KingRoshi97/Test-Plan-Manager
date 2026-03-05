---
library: policy
id: POL-3
section: precedence_model
schema_version: 1.0.0
status: draft
---

# POL-3 — Policy Precedence + Conflict Resolution

## Purpose
Policies may come from multiple layers (workspace defaults, project bindings, run overrides).
This section defines deterministic precedence and conflict rules.

## Layers (from lowest to highest precedence)
1) **Global defaults** (shipped policy registries)
2) **Workspace policy set** (workspace defaults)
3) **Project policy set** (project bindings override workspace)
4) **Run-time policy decisions** (policy hook outcomes recorded in run manifest)
5) **Approved overrides** (explicit override decisions with expiry)

## Conflict rules (hard and simple)
- **Most restrictive wins** by default.
- Overrides can relax restrictions only if explicitly allowed by policy set.
- If two rules conflict and neither is strictly more restrictive, deny by default.

## Examples
- If workspace allows external execution but project forbids it → forbid (project wins).
- If risk class says "verified knowledge required" but run requests "draft" → deny unless
approved override exists and policy set allows it.
