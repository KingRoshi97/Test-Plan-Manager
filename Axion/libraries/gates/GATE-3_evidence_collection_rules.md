---
library: gates
id: GATE-3
section: evidence_collection_rules
schema_version: 1.0.0
status: draft
---

# GATE-3 — Evidence Collection Rules

## Overview
Evidence is the factual record of what was checked and what was found during gate evaluation.
Every predicate evaluation produces evidence, whether the predicate passes or fails.

## Evidence Structure

Each evidence entry contains:

| Field | Type | Required | Description |
|---|---|---|---|
| `path` | string | yes | File path or resource identifier that was checked |
| `pointer` | string | yes | JSON pointer within the resource (empty string if N/A) |
| `details` | object | yes | Key-value pairs with evaluation details |

## Collection Rules

### 1. Mandatory Collection
Every predicate evaluation must produce at least one evidence entry. A predicate that
produces no evidence is a runtime error.

### 2. Evidence on Pass
When a predicate passes, evidence records:
- The path/resource that was checked
- The pointer within the resource (if applicable)
- An empty or minimal details object

### 3. Evidence on Fail
When a predicate fails, evidence records:
- The path/resource that was checked
- The pointer within the resource (if applicable)
- Details including:
  - `error`: Human-readable error description
  - Expected vs. actual values (when applicable)
  - Minimum thresholds vs. actual values (for coverage checks)

### 4. Evidence Referencing
Evidence references use relative paths from the run directory. Absolute paths are
converted to relative paths before recording.

### 5. Evidence Integrity
- Evidence is append-only within a gate evaluation.
- Evidence entries are not modified after creation.
- Evidence is written to the gate report and is immutable once the report is finalized.

## Evidence Types by Operation

| Operation | Evidence Contains |
|---|---|
| `file_exists` | path, existence status |
| `json_valid` | path, parse result |
| `json_has` | path, pointer, field existence |
| `coverage_gte` | path, pointer, min_required, actual value |
| `json_eq` | path, pointer, expected value, actual value |
| `verify_hash_manifest` | manifest path, file count, hash verification results |

## Evidence Completeness
After all predicates are evaluated, the runtime checks evidence completeness against
the gate's `evidence_policy.proof_types`. Missing proof types are recorded as warnings
in the gate report's `evidence_completeness` section.
