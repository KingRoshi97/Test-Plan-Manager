# FEAT-007 — Template Registry & Renderer: Observability

## 1. Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `templates.index.total` | gauge | Total templates in index |
| `templates.selected.count` | gauge | Templates selected for this run |
| `templates.selected.always` | gauge | Templates included via `requiredness: "always"` |
| `templates.selected.conditional` | gauge | Templates included via conditional matching |
| `templates.knowledge_boosted.count` | gauge | Templates knowledge-boosted during selection |
| `templates.rendered.count` | gauge | Templates successfully rendered |
| `templates.placeholders.resolved` | counter | Total placeholders resolved across all templates |
| `templates.placeholders.unresolved` | counter | Total unresolved placeholders |
| `templates.completeness.pass` | gauge | 1 if completeness report passes, 0 otherwise |
| `templates.completeness.blocking` | gauge | Count of templates with `blocking: true` |

## 2. Logging

### 2.1 Key Log Events

| Event | Level | Source | Data |
|-------|-------|--------|------|
| Template index loaded | INFO | `selector.ts` | `total_templates`, `index_version` |
| Templates selected | INFO | `evidence.ts` | `selected_count`, `selection_hash` |
| Knowledge boost applied | INFO | `evidence.ts` | `boosted_count`, `boosted_template_ids` |
| Knowledge resolution failed | WARN | `evidence.ts` | (caught silently) |
| Template rendered | DEBUG | `evidence.ts` | `template_id`, `placeholders_resolved`, `placeholders_unresolved` |
| Completeness report generated | INFO | `evidence.ts` | `pass`, `complete_count`, `incomplete_count` |
| Guardrail violation | ERROR | `evidence.ts` | `target_path` |

### 2.2 Structured Log Fields

- `feature`: `FEAT-007`
- `domain`: `templates`
- `operation`: `select` | `fill` | `render` | `completeness`
- `run_id`: Current pipeline run identifier
- `template_id`: Template being processed (when applicable)

### 2.3 Log Levels

- `ERROR`: Guardrail violations, file system errors
- `WARN`: Knowledge resolution failures, missing upstream artifacts
- `INFO`: Selection results, render summaries, completeness results
- `DEBUG`: Per-template render details, placeholder resolution traces

## 3. Evidence Files as Observability

The template pipeline writes structured JSON evidence that serves as observability:

- `selection_report.json` — selection metadata, knowledge citations, notes
- `render_report.json` — render summary, unresolved placeholders, knowledge domains
- `template_completeness_report.json` — per-template completeness status

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
