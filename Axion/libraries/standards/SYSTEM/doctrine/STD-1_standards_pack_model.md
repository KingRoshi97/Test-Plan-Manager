---
library: standards
id: STD-1
schema_version: 1.0.0
status: draft
---

# STD-1 — Standards Pack Model

## Purpose
Define what a standards pack is, how it is structured, and how it can be applied deterministically.

## What a standards pack contains
A pack is a versioned, named set of enforceable rules:
- constraints (must/must_not)
- defaults (recommended baseline settings)
- required artifacts (what must be produced)
- verification commands (what must be run)
- policies (naming, layout, dependency boundaries)

## Core fields (minimum)
- pack_id (stable)
- title
- version
- scope (what contexts this pack applies to)
- rules[] (ordered, typed rules)
- created_at, updated_at, owner
