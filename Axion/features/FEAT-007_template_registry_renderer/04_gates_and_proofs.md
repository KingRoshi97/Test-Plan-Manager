# FEAT-007 — Template Registry & Renderer: Gates & Proofs

## 1. Applicable Gates

### GATE-07 — Template Gate (Filled Doc Completeness)

Evaluates the `template_completeness_report.json` produced by `buildCompletenessReport()`. The gate passes when `report.pass === true`, meaning no template with `requiredness: "always"` has blocking unresolved fields.

**Gate checks:**
- `template_completeness_report.json` exists in `runs/<id>/templates/`
- `report.pass === true`
- No entry has `blocking: true`

**Hard stop conditions:**
- Any `requiredness: "always"` template has required fields that are unresolved and not in the `UNKNOWN_ALLOWED` set

**Soft warnings:**
- `requiredness: "conditional"` templates with unresolved fields (non-blocking)

## 2. Evidence Artifacts

The template pipeline produces these evidence files for gate evaluation:

| Artifact | Path | Purpose |
|----------|------|---------|
| `selection_result.json` | `runs/<id>/templates/` | Proves which templates were selected and why |
| `selection_report.json` | `runs/<id>/templates/` | Selection metadata with knowledge citations |
| `render_envelopes.json` | `runs/<id>/templates/` | Per-template render metadata and content hashes |
| `render_report.json` | `runs/<id>/templates/` | Summary of all rendered templates |
| `template_completeness_report.json` | `runs/<id>/templates/` | Pass/fail per template; used by GATE-07 |
| `rendered_docs/*.md` | `runs/<id>/templates/rendered_docs/` | Actual filled documents |

## 3. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | `writeSelectionResult` and `writeRenderedDocs` execution logs |
| P-02 | Test Result Proof | Unit tests for selector, filler, renderer, completeness |
| P-03 | File/Artifact Proof | `selection_result.json`, `render_envelopes.json`, `template_completeness_report.json` |
| P-05 | Diff/Commit Reference Proof | Code change verification for template modules |

## 4. Gate Report Contract

Every gate produces a report per ORD-02 Section 7:

- `gate_id` — `GATE-07`
- `target` — `template_completeness_report.json`
- `status` — `pass` | `fail`
- `executed_at` — ISO timestamp
- `issues[]` — Array of issue objects for each blocking template

## 5. Override Policy

- Overrides allowed only if gate rule declares `overridable: true`
- Override records must include: override_id, gate_id, rule_id, approver, reason, risk_acknowledged, timestamp
- Overrides annotate the failure; they never delete it

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
- TMP-05 (Template Completeness Rules)
