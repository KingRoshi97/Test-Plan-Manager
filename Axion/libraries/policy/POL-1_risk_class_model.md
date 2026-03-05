---
library: policy
id: POL-1
section: risk_class_model
schema_version: 1.0.0
status: draft
---

# POL-1 — Risk Class Model

## Purpose
Risk classes define the baseline strictness of a run. They drive:
- minimum maturity thresholds (knowledge/standards)
- which gates are hard-stop vs warn vs optional
- whether external executors are allowed
- whether approvals are required for certain actions

## Core risk classes (minimum)
- PROTOTYPE: speed-first, lowest constraints
- PROD: reliability + security baseline
- COMPLIANCE: regulated/high-stakes constraints

## What risk classes control (minimum knobs)
- knowledge min_maturity
- standards strictness level
- template completeness strictness
- verification requirements (proof types required)
- override availability (what can be overridden)
