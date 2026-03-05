# FEAT-007 — Template Registry & Renderer: API Surface

## 1. Module Exports

| Module | Path |
|--------|------|
| Selector | `src/core/templates/selector.ts` |
| Filler | `src/core/templates/filler.ts` |
| Renderer | `src/core/templates/renderer.ts` |
| Completeness | `src/core/templates/completeness.ts` |
| Completeness Gate | `src/core/templates/completenessGate.ts` |
| Evidence | `src/core/templates/evidence.ts` |
| Index (re-exports) | `src/core/templates/index.ts` |

## 2. Public Functions

### `selectTemplates(baseDir, routing?, constraints?, canonicalSpec?, standardsSnapshot?, knowledgeContext?)`

- **Module**: `selector.ts`
- **Parameters**:
  - `baseDir: string` — Axion root directory
  - `routing?: Record<string, unknown>` — routing data from intake (e.g., `skill_level`, `category`)
  - `constraints?: Record<string, unknown>` — constraints from intake
  - `canonicalSpec?: Record<string, unknown>` — canonical spec (unused in selection, reserved)
  - `standardsSnapshot?: Record<string, unknown>` — standards snapshot (unused in selection, reserved)
  - `knowledgeContext?: KnowledgeContext` — resolved knowledge for domain-based boosting
- **Returns**: `{ selected: SelectedTemplate[]; index: TemplateIndex; knowledgeBoostedIds: string[] }`
- **Behavior**: Loads template index, filters by `status: "active"`, applies `requiredness`/`applies_when`/`skill_level`/knowledge-boost rules, returns sorted selected templates

### `computeSelectionHash(selected)`

- **Module**: `selector.ts`
- **Parameters**: `selected: SelectedTemplate[]`
- **Returns**: `string` — 16-char hex hash of sorted `template_id@version` pairs

### `fillTemplate(templateEntry, templateContent, context)`

- **Module**: `filler.ts`
- **Parameters**:
  - `templateEntry: SelectedTemplate` — metadata for the template being filled
  - `templateContent: string` — raw markdown content of the template file
  - `context: FillContext` — spec, standards, work, acceptance, normalizedInput, IDs, knowledge
- **Returns**: `FilledTemplate` — filled content with placeholder resolution counts and unknowns list
- **Behavior**: Extracts Section 7 (Output Format) headings from template, generates content for each heading by matching title keywords to spec entities. Falls back to Section 4 (Required Fields) table, then to entity dump.

### `parsePlaceholder(raw)`

- **Module**: `filler.ts`
- **Parameters**: `raw: string` — raw placeholder string
- **Returns**: `PlaceholderSyntax` — one of 5 types: `direct`, `array`, `derived`, `optional`, `unknown_allowed`

### `resolvePlaceholder(syntax, context)`

- **Module**: `filler.ts`
- **Parameters**: `syntax: PlaceholderSyntax`, `context: FillContext`
- **Returns**: `unknown` — resolved value or `undefined`/`null` depending on placeholder type

### `renderTemplate(content, context)`

- **Module**: `renderer.ts`
- **Parameters**: `content: string`, `context: Record<string, unknown>`
- **Returns**: `string` — content with `{{key}}` placeholders replaced by context values; unresolved placeholders left as-is

### `countPlaceholders(content)`

- **Module**: `renderer.ts`
- **Parameters**: `content: string`
- **Returns**: `number` — count of `{{...}}` occurrences

### `scanUnresolvedPlaceholders(content)`

- **Module**: `renderer.ts`
- **Parameters**: `content: string`
- **Returns**: `UnresolvedEntry[]` — sorted unique placeholder keys with occurrence counts

### `buildAutoContext(templateContents, overrides?)`

- **Module**: `renderer.ts`
- **Parameters**: `templateContents: string[]`, `overrides?: Record<string, unknown>`
- **Returns**: `Record<string, unknown>` — nested context skeleton with `"__AXION_VALUE__"` for each discovered key, overrides applied

### `writeSelectionResult(runDir, runId, generatedAt, baseDir, canonicalSpec?, standardsSnapshot?)`

- **Module**: `evidence.ts`
- **Parameters**: `runDir: string`, `runId: string`, `generatedAt: string`, `baseDir: string`, `canonicalSpec?: Record<string, unknown>`, `standardsSnapshot?: Record<string, unknown>`
- **Returns**: `void`
- **Side Effects**: Writes `selection_result.json` and `selection_report.json` to `runDir/templates/`

### `writeRenderedDocs(runDir, runId, generatedAt, baseDir)`

- **Module**: `evidence.ts`
- **Parameters**: `runDir: string`, `runId: string`, `generatedAt: string`, `baseDir: string`
- **Returns**: `void`
- **Side Effects**: Reads selection result, loads upstream artifacts, fills each template, writes rendered docs, render envelopes, render report, and completeness report

### `checkCompleteness(filled, spec)` *(stub)*

- **Module**: `completenessGate.ts`
- **Status**: Throws `NotImplementedError` — superseded by `checkTemplateCompleteness` in `completeness.ts`

### `checkAllTemplates(filledTemplates, spec)` *(stub)*

- **Module**: `completenessGate.ts`
- **Status**: Throws `NotImplementedError` — superseded by `buildCompletenessReport` in `completeness.ts`

### `loadPlaceholderCatalog(baseDir)`

- **Module**: `completeness.ts`
- **Parameters**: `baseDir: string`
- **Returns**: `PlaceholderCatalog`

### `checkTemplateCompleteness(templateId, requiredness, totalPlaceholders, unresolvedFields, catalog, unknownAllowedFields?)`

- **Module**: `completeness.ts`
- **Returns**: `TemplateCompletenessEntry`

### `buildCompletenessReport(runId, checkedAt, entries)`

- **Module**: `completeness.ts`
- **Returns**: `TemplateCompletenessReport`

## 3. Types

### From `selector.ts`

- `TemplateIndexEntry` — single entry in template index (template_id, title, type, applies_when, requiredness, etc.)
- `TemplateIndex` — full index document ($schema, versions, templates array)
- `SelectedTemplate` — selected template record (template_id, version, paths, rationale, requiredness)
- `TemplateSelectionResult` — selection output (run_id, selection_hash, selected array)

### From `filler.ts`

- `FillContext` — context for template filling (spec, standards, work, acceptance, normalizedInput, IDs, knowledge)
- `FilledTemplate` — filled template output (template_id, version, content, placeholder counts, unknowns)
- `PlaceholderSyntax` — discriminated union: `direct | array | derived | optional | unknown_allowed`

### From `renderer.ts`

- `UnresolvedEntry` — unresolved placeholder key with occurrence count

### From `completeness.ts`

- `PlaceholderCatalog` — catalog schema (version, roots, flags, syntax, derived_functions)
- `TemplateCompletenessEntry` — per-template completeness (complete, blocking, resolved/unresolved counts)
- `TemplateCompletenessReport` — report (pass, complete/incomplete counts, entries)

### From `completenessGate.ts`

- `CompletenessCheck` — single check result (check_id, passed, details)
- `CompletenessResult` — template completeness result (is_complete, checks, flags)

## 4. Error Codes

See 02_errors.md for the complete error code table for this feature.

## 5. Integration Points

- FEAT-001 (Control Plane Core) — run directory structure, run lifecycle
- FEAT-003 (Gate Engine Core) — GATE-07 evaluates completeness report
- FEAT-006 (Standards Resolution Engine) — provides standards snapshot
- Knowledge Library — `resolveKnowledge()` provides `KnowledgeContext`

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
