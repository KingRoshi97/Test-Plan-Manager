# FEAT-007 — Template Registry & Renderer: Documentation Requirements

## 1. System Documentation References

| Document | ID | Relevance |
|----------|----|-----------|
| Template Index Registry | TMP-01 | Defines the `template_index.json` schema and registry rules |
| Template File Contract | TMP-02 | Defines the 11-section markdown structure for templates |
| Template Selection Rules | TMP-03 | Defines `applies_when`, `requiredness`, and `required_by_skill_level` logic |
| Template Fill Rules | TMP-04 | Defines placeholder resolution precedence and 5 placeholder types |
| Template Completeness Rules | TMP-05 | Defines completeness checking, blocking logic, and UNKNOWN policy |
| End-to-End Architecture | SYS-03 | Template pipeline position in the overall run flow |
| Compliance & Gate Model | SYS-07 | GATE-07 definition and gate report contract |

## 2. API Documentation

All exported functions have TypeScript type signatures. Key exports from `index.ts`:

- `selectTemplates` — template selection engine
- `fillTemplate` — template filling engine
- `renderTemplate` — simple `{{key}}` placeholder renderer
- `countPlaceholders` — count `{{...}}` occurrences in content
- `scanUnresolvedPlaceholders` — find unresolved `{{key}}` entries
- `buildAutoContext` — build context skeleton from template placeholders
- `writeSelectionResult` — orchestrate selection and write evidence
- `writeRenderedDocs` — orchestrate rendering, filling, completeness, and write evidence
- `parsePlaceholder` — parse raw placeholder string into `PlaceholderSyntax`
- `resolvePlaceholder` — resolve parsed placeholder against `FillContext`
- `checkCompleteness` — single template completeness check (legacy interface, stub)
- `checkAllTemplates` — batch completeness check (legacy interface, stub)

## 3. Architecture Documentation

### Data Flow

```
template_index.json
        |
        v
  selectTemplates() ──> selection_result.json
        |                selection_report.json
        v
  fillTemplate() ──────> rendered_docs/<id>.md
        |                 render_envelopes.json
        v                 render_report.json
  checkTemplateCompleteness()
        |
        v
  buildCompletenessReport() ──> template_completeness_report.json
        |
        v
  GATE-07 evaluation
```

### Module Dependency Graph

- `evidence.ts` → `selector.ts`, `filler.ts`, `renderer.ts`, `completeness.ts`, `knowledge/resolver.ts`
- `filler.ts` → `selector.ts` (types), `knowledge/resolver.ts`
- `selector.ts` → `knowledge/resolver.ts` (types)
- `completeness.ts` → (standalone)
- `renderer.ts` → (standalone)
- `index.ts` → re-exports from all modules

## 4. Change Log

- All changes to this feature must be recorded
- Breaking changes must follow GOV-03 (Deprecation & Migration Rules)
- Version stamps per GOV-01 (Versioning Policy)

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
- GOV-03 (Deprecation & Migration Rules)
