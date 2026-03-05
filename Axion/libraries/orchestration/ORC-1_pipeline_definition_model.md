---
library: orchestration
id: ORC-1
schema_version: 1.0.0
status: draft
---

# ORC-1 — Pipeline Definition Model

## Purpose
Define the authoritative model for a pipeline: its stages, ordering, activation rules, and gating
points.

## Core entities
- **Pipeline**: named definition of stages + order + version
- **Stage**: step in the pipeline with a stable stage_id
- **Activation rule**: conditions that enable/skip a stage (deterministic)
- **Gating point**: stage boundary where a gate must pass before continuing

## Required fields
Pipeline must include:
- pipeline_id (stable)
- version
- stage_order (ordered list of stage_id)
- stages map (stage_id → stage definition)
- gate_points (optional list of gates and where they apply)
- created_at, updated_at, owner

Stage definition must include:
- stage_id (stable)
- name
- consumes (input contract refs)
- produces (output contract refs)
- can_rerun (boolean)
- failure_policy (hard_stop vs retryable vs gate_pause)
