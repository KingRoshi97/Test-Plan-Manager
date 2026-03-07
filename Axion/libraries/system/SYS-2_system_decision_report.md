---
library: system
id: SYS-2-GOV
schema_version: 1.0.0
status: draft
---

# SYS-2 — System Decision Report

## Purpose

A system decision report captures the full trace of decisions made by the Axion control plane
during a single run's system resolution phase. It records library resolution order, pin
decisions, capability filtering results, and the final verdict.

## Report Structure

Each decision report contains:

| Section | Description |
|---|---|
| `report_id` | Unique identifier for this report, pattern `SDR-[A-Z0-9]{8,}` |
| `run_id` | The run this report belongs to |
| `timestamp` | ISO 8601 timestamp of report generation |
| `resolution_steps` | Ordered list of resolution steps executed |
| `pin_decisions` | Pin/lock decisions applied during resolution |
| `capability_filter_results` | Capability filtering outcomes per unit |
| `verdict` | Final resolution verdict |

## Resolution Steps

Each resolution step records:

- `step_index` — ordinal position in the resolution sequence
- `component_id` — the system unit being resolved
- `action` — one of: `resolved`, `skipped`, `failed`, `deferred`
- `reason` — human-readable explanation
- `duration_ms` — time taken for this step

## Pin Decisions

Pin decisions record how each pinnable artifact was resolved:

- `artifact_id` — the artifact being pinned
- `pin_mode` — the pin mode applied (`pinned`, `locked`, `floating`, `inherit`)
- `requested_version` — the version requested by the workspace/project
- `resolved_version` — the version actually resolved
- `pin_source` — where the pin policy originated (workspace, project, profile, default)

## Capability Filtering Results

For each system unit evaluated:

- `component_id` — the unit evaluated
- `required_capabilities` — capabilities the unit needs
- `available_capabilities` — capabilities present in the runtime
- `satisfied` — boolean indicating whether all requirements were met
- `excluded_reason` — if not satisfied, the specific missing capabilities

## Verdict

The verdict is the final outcome of system resolution:

| Verdict | Description |
|---|---|
| `pass` | All units resolved successfully, all pins satisfied |
| `pass_with_warnings` | Resolution succeeded but with non-critical warnings |
| `fail` | One or more critical units failed to resolve |
| `blocked` | Resolution blocked by policy or quota violation |

## Retention

Decision reports are retained for the lifetime of the run plus the configured audit
retention period. Reports are immutable once generated.
