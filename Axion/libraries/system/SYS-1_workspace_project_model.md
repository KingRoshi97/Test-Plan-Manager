---
library: system
id: SYS-1
schema_version: 1.0.0
status: draft
---

# SYS-1 — Workspace / Project Model

## Purpose
Define the canonical structure for organizing Axion usage into stable namespaces with
predictable permissions, quotas, and pin policies.

## Core entities
- **Workspace**: top-level namespace (usually an org or environment boundary)
- **Project**: runnable unit inside a workspace (runs, templates, policies, and pins attach here)
- **Profile**: execution profile for a run context (API/Web/Mobile/etc.), used for quotas and
selection

## Required properties (high level)
Workspace must have:
- workspace_id (stable)
- name
- owner
- created_at, updated_at
- default_policies (pins/locks baseline, quota baseline)

Project must have:
- project_id (stable)
- workspace_id (parent)
- name
- owners / maintainers
- created_at, updated_at
- run_profiles enabled
- policy bindings (risk defaults, overrides permissions)
- quota bindings
- pin/lock bindings (what can be pinned, who can pin)

Profile must have:
- profile_id (stable, enumerated)
- name
- capability requirements (adapter constraints)
- quota modifiers (optional)
