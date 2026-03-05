# FEAT-007 — Template Registry & Renderer: Contract

## 1. Purpose

Manages the full template lifecycle: selecting applicable templates from the template index, filling them with data from the canonical spec / standards / planning artifacts / knowledge library, rendering simple `{{key}}` placeholders, checking completeness against catalog rules, and writing all evidence artifacts to the run directory.

## 2. Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Template Index | `libraries/templates/template_index.json` | Registry of all `TemplateIndexEntry` records |
| Template Files | `libraries/templates/**/*.md` | Raw markdown template files with output format sections |
| Canonical Spec | `runs/<id>/canonical/canonical_spec.json` | Entities, routing, rules, meta, unknowns |
| Standards Snapshot | `runs/<id>/standards/resolved_standards_snapshot.json` | Resolved standards rules |
| Normalized Input | `runs/<id>/intake/normalized_input.json` | Routing and constraints from intake |
| Work Breakdown | `runs/<id>/planning/work_breakdown.json` | Work units from planning |
| Acceptance Map | `runs/<id>/planning/acceptance_map.json` | Acceptance items from planning |
| Placeholder Catalog | `libraries/templates/placeholder_catalog.v1.json` | Known placeholder roots, flags, derived functions |
| Knowledge Context | Resolved at runtime via `resolveKnowledge()` | KID entries, domain map, citation refs |

## 3. Outputs

| Output | Path | Description |
|--------|------|-------------|
| Selection Result | `runs/<id>/templates/selection_result.json` | `TemplateSelectionResult` with selected template list and hash |
| Selection Report | `runs/<id>/templates/selection_report.json` | Metadata: counts, knowledge citations, boosted templates |
| Rendered Documents | `runs/<id>/templates/rendered_docs/<template_id>.md` | Filled markdown documents |
| Render Envelopes | `runs/<id>/templates/render_envelopes.json` | Per-template metadata: field counts, content hashes |
| Render Report | `runs/<id>/templates/render_report.json` | Summary: total rendered, unresolved placeholders, knowledge citations |
| Completeness Report | `runs/<id>/templates/template_completeness_report.json` | `TemplateCompletenessReport` with pass/fail per template |

## 4. Invariants

- Template selection is deterministic: same inputs produce the same `selection_hash` (SHA-256 of sorted `template_id@version` pairs, truncated to 16 chars)
- Only templates with `status: "active"` in the index are considered
- Templates with `requiredness: "always"` are always included
- Templates with `requiredness: "conditional"` are included only when `applies_when` matches routing/constraints and `required_by_skill_level` does not resolve to `"omit"`
- No content is invented — all filled content derives from spec entities, routing, rules, standards, work breakdown, acceptance map, or is tagged `UNKNOWN_ALLOWED`
- Cross-references in templates resolve to canonical spec IDs
- Rendered output is never written back to `libraries/templates/` (guardrail enforced by `assertNotTemplateLibrary`)
- Completeness report `pass` is `true` only when no template has `blocking: true` (i.e., no `requiredness: "always"` template has required unresolved fields)

## 5. Dependencies

- FEAT-001 (Control Plane Core) — run lifecycle, run directory structure
- FEAT-003 (Gate Engine Core) — GATE-07 evaluates completeness report
- FEAT-006 (Standards Resolution Engine) — provides resolved standards snapshot

## 6. Source Modules

| Module | Lines | Role |
|--------|-------|------|
| `src/core/templates/selector.ts` | 222 | Template selection engine |
| `src/core/templates/filler.ts` | 788 | Template filling engine with heading-based content generation |
| `src/core/templates/renderer.ts` | 107 | Simple `{{key}}` placeholder renderer |
| `src/core/templates/completeness.ts` | 89 | Completeness checking and report building |
| `src/core/templates/completenessGate.ts` | 27 | Completeness gate interface (stub) |
| `src/core/templates/evidence.ts` | 299 | Orchestration: write selection result and rendered docs |
| `src/core/templates/index.ts` | 13 | Re-exports |

## 7. Failure Modes

| Failure | Impact | Mitigation |
|---------|--------|------------|
| Template index file missing | Selection cannot proceed | `readJson` throws; pipeline halts at template selection stage |
| Template source file unreadable | Rendered output is empty | `rawContent` defaults to empty string; filled doc will have no headings |
| Canonical spec missing | All entity-derived sections render as empty | Filled doc shows "No items defined" or placeholder text |
| Knowledge resolution failure | Knowledge-boosted templates not boosted | Caught silently; selection proceeds without knowledge context |
| Write to template library directory | Guardrail violation | `assertNotTemplateLibrary` throws error before write |
| Blocking unresolved fields on `always` template | Completeness gate fails | `TemplateCompletenessReport.pass` is `false`; GATE-07 blocks pipeline |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- TMP-01 (Template Index Registry)
- TMP-02 (Template File Contract)
- TMP-03 (Template Selection Rules)
- TMP-04 (Template Fill Rules)
- TMP-05 (Template Completeness Rules)
- GATE-07 — Template Gate (Filled Doc Completeness)
