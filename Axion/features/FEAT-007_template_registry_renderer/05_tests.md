# FEAT-007 — Template Registry & Renderer: Test Plan

## 1. Unit Tests

### 1.1 Selector (`selector.ts`)

- `selectTemplates()` — includes all `requiredness: "always"` templates
- `selectTemplates()` — excludes templates with `status !== "active"`
- `selectTemplates()` — excludes conditional templates where `applies_when` does not match routing/constraints
- `selectTemplates()` — excludes conditional templates where `required_by_skill_level[level] === "omit"`
- `selectTemplates()` — includes conditional templates matching `applies_when` with array values
- `selectTemplates()` — includes conditional templates matching `applies_when` with boolean values
- `selectTemplates()` — marks knowledge-boosted template IDs when `KnowledgeContext` has domain overlap
- `selectTemplates()` — defaults `skill_level` to `"intermediate"` when not provided
- `selectTemplates()` — sorts selected templates by `template_id`
- `computeSelectionHash()` — returns deterministic 16-char hex hash for same input
- `computeSelectionHash()` — produces different hashes for different template sets
- `matchesAppliesWhen()` — returns `true` for empty `applies_when`
- `getTemplateDomains()` — maps template title/type/id keywords to IT domain strings
- `hasKnowledgeDomainOverlap()` — detects overlap between template domains and knowledge context domains
- `buildRationale()` — includes `requiredness=always` for always-required templates
- `buildRationale()` — includes `knowledge_boost` when template is knowledge-boosted

### 1.2 Filler (`filler.ts`)

- `parsePlaceholder()` — parses `direct` type (plain dotted path)
- `parsePlaceholder()` — parses `array` type (path ending with `[]`)
- `parsePlaceholder()` — parses `derived` type (`derive:FUNC(args)`)
- `parsePlaceholder()` — parses `optional` type (path ending with `|OPTIONAL`)
- `parsePlaceholder()` — parses `unknown_allowed` type (path ending with `|UNKNOWN_ALLOWED`)
- `resolvePlaceholder()` — resolves `direct` from context sources in order: spec, standards, work, acceptance, normalizedInput
- `resolvePlaceholder()` — resolves `direct` from direct map (submission_id, spec_id, standards_id, run_id)
- `resolvePlaceholder()` — returns `null` for `optional` when path not found
- `resolvePlaceholder()` — returns `undefined` for `unknown_allowed` when path not found
- `resolvePlaceholder()` — calls `runDerivedFunction` for `derived` type
- `runDerivedFunction("ROLE_TO_WORKFLOWS")` — maps roles to workflows via `actor_role_ref`
- `runDerivedFunction("FEATURE_TO_OPERATIONS")` — generates feature-to-operations mapping
- `runDerivedFunction("ROLE_PERMISSION_MATRIX")` — builds role-permission matrix from entities
- `extractOutputFormat()` — extracts headings from template Section 7 (Output Format)
- `extractOutputFormat()` — returns empty array when no Section 7 exists
- `fillTemplate()` — produces `FilledTemplate` with correct `placeholders_resolved` count
- `fillTemplate()` — adds `UNKNOWN_ALLOWED` entries to `unknowns` array for unresolvable headings
- `fillTemplate()` — adds `BLOCKED` entries for required fields without values
- `fillTemplate()` — renders entity tables with `renderEntityArray` including column headers
- `fillTemplate()` — appends knowledge references to heading content when knowledge context available
- `fillTemplate()` — falls back to required-fields-table rendering when no Section 7 headings
- `fillTemplate()` — falls back to entity dump when neither headings nor required fields exist

### 1.3 Renderer (`renderer.ts`)

- `renderTemplate()` — replaces `{{key}}` placeholders with context values
- `renderTemplate()` — supports dotted paths (`{{a.b.c}}`)
- `renderTemplate()` — leaves unresolved placeholders unchanged
- `renderTemplate()` — handles null/undefined values as empty string
- `renderTemplate()` — serializes objects as JSON strings
- `countPlaceholders()` — counts total `{{...}}` occurrences
- `scanUnresolvedPlaceholders()` — returns sorted unique placeholder keys with occurrence counts
- `buildAutoContext()` — builds nested context object from template placeholder keys
- `buildAutoContext()` — applies overrides to generated context

### 1.4 Completeness (`completeness.ts`)

- `loadPlaceholderCatalog()` — loads catalog from `libraries/templates/placeholder_catalog.v1.json`
- `checkTemplateCompleteness()` — marks complete when no required unresolved fields
- `checkTemplateCompleteness()` — excludes `|OPTIONAL` and `|UNKNOWN_ALLOWED` suffixed fields from required check
- `checkTemplateCompleteness()` — excludes fields in `unknownAllowedFields` set from required check
- `checkTemplateCompleteness()` — sets `blocking: true` only for `requiredness: "always"` with required unresolved
- `buildCompletenessReport()` — sets `pass: true` when no entries have `blocking: true`
- `buildCompletenessReport()` — sets `pass: false` when any entry has `blocking: true`

## 2. Integration Tests

- Full pipeline: `writeSelectionResult` → `writeRenderedDocs` with fixture data
- Template selection + filling + completeness check end-to-end
- Knowledge context integration: verify knowledge-boosted templates receive citations
- Guardrail test: `assertNotTemplateLibrary` blocks writes to `libraries/templates/`

## 3. Acceptance Tests

- All invariants from 01_contract.md hold for a valid run
- GATE-07 passes when all required templates resolve
- GATE-07 fails when a required template has blocking unresolved fields
- Selection hash is deterministic across identical inputs

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (template index, template files, canonical spec, standards snapshot)
- Helpers: `test/helpers/`
