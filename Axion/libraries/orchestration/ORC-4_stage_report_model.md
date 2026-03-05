---
library: orchestration
id: ORC-4
schema_version: 1.0.0
status: draft
---

# ORC-4 — Stage Report Model

## Purpose
Every stage emits a stage report so operators and downstream gates can understand:
- what inputs were used (refs)
- what outputs were produced (refs)
- what validations ran
- what errors/warnings occurred
- what evidence is available for gates

## Principles
- Reports are machine-readable and uniform across stages.
- Reports point to artifacts by path + optional hash (not embedded content).
- Reports capture the "why" minimally (decisions, not essays).
