---
library: gates
id: GATE-4
section: validation_checklist
schema_version: 1.0.0
status: draft
---

# GATE-4 — Validation Checklist (Gate Reports)

## Report Schema Validation
- [ ] Report conforms to `gate_report.v1.schema.json`
- [ ] `run_id` is a non-empty string
- [ ] `gate_id` matches a gate in the registry
- [ ] `stage_id` matches a valid pipeline stage
- [ ] `status` is one of: `pass`, `fail`, `warn`
- [ ] `evaluated_at` is a valid ISO 8601 timestamp
- [ ] `engine.name` is a non-empty string
- [ ] `engine.version` is a valid semver string

## Checks Validation
- [ ] `checks` array is non-empty
- [ ] Each check has a valid `check_id`
- [ ] Each check has a `status` of `pass`, `fail`, or `warn`
- [ ] Failed checks have a non-null `failure_code`
- [ ] Passing checks have a null `failure_code`
- [ ] Each check has at least one evidence entry

## Evidence Validation
- [ ] All evidence paths are relative (not absolute)
- [ ] All evidence pointers are valid JSON pointers (or empty string)
- [ ] Evidence details are valid JSON objects
- [ ] Failed checks include error details in evidence

## Override Validation (if present)
- [ ] `override.overridden_by` is a non-empty string
- [ ] `override.role` is a valid role identifier
- [ ] `override.justification` is a non-empty string
- [ ] `override.overridden_at` is a valid ISO 8601 timestamp
- [ ] `override.original_status` matches the pre-override status

## Integrity Validation
- [ ] Report file exists at expected path: `{run_dir}/gates/{gate_id}.gate_report.json`
- [ ] Run manifest contains a reference to this report
- [ ] Report content has not been modified after creation (hash check)
