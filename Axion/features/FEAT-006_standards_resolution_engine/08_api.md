# FEAT-006 — Standards Resolution Engine: API Surface

## 1. Module: `src/core/standards/registryLoader.ts`

### `loadStandardsRegistry(repoRoot: string): LoadedStandardsRegistry`

Loads the full standards library from disk.

- **Reads**: `{repoRoot}/libraries/standards/standards_index.json`, `resolver_rules.v1.json`, and all pack files referenced in the index
- **Returns**: `{ index: StandardsIndex, packs: StandardsPack[], resolverRules: ResolverRules }`
- **Throws**: `Error` if any required file is missing

### Exported Types

- `PackIndexEntry` — `{ pack_id, pack_version, category, applies_when, priority, rule_count, file_path }`
- `StandardsIndex` — `{ standards_library_version, description, categories[], packs: PackIndexEntry[] }`
- `PackRule` — `{ rule_id, name, description, rule_type: "requirement"|"constraint"|"default"|"prohibition", value, fixed, source_pack }`
- `StandardsPack` — `{ pack_id, pack_version, category, description, applies_when, priority, fixed_rules: PackRule[], configurable_rules: PackRule[] }`
- `ResolverRules` — `{ version, description, selection, order, conflicts, overrides, output }`
- `LoadedStandardsRegistry` — `{ index, packs, resolverRules }`

## 2. Module: `src/core/standards/applicability.ts`

### `evaluateApplicability(routing: RoutingSnapshot, constraints: Record<string, unknown>, packs: Array<{pack_id, pack_version, applies_when}>, resolverRules: ResolverRules, runId: string, evaluatedAt: string): ApplicabilityOutput`

Evaluates each pack's `applies_when` clause against the run context (routing + constraints + gate defaults).

- **Match scoring**: Ratio of matching fields to total fields in `applies_when.routing` and `applies_when.gates`
- **Universal packs**: Packs with empty `applies_when` get `match_score: 1`
- **Case sensitivity**: Routing values compared case-insensitively; gates values compared exactly
- **Returns**: `{ run_id, evaluated_at, matched_packs: ApplicabilityMatch[], unmatched_packs: string[] }`

### Exported Types

- `ApplicabilityMatch` — `{ pack_id, version, rationale, match_score }`
- `ApplicabilityOutput` — `{ run_id, evaluated_at, matched_packs[], unmatched_packs[] }`

## 3. Module: `src/core/standards/resolver.ts`

### `computeResolverContext(normalizedInput: unknown): ResolverContext`

Derives the resolver context from normalized intake input.

- Extracts `routing` and `constraints` from the input
- Sets gate defaults: `{ data_enabled: true, auth_required: true, integrations_enabled: false }`
- Derives `delivery.scope` and `delivery.priority_bias` from `constraints.delivery`

### `resolveStandards(normalizedInput: unknown, registry: LoadedStandardsRegistry, matchedPacks: ApplicabilityMatch[], runId: string): { snapshot: ResolvedStandardsSnapshot, resolverOutput: ResolverOutput }`

Core resolution function. Performs:

1. **Context computation** via `computeResolverContext`
2. **Pack ordering** by priority (direction from `resolverRules.order.priority_direction`), with tiebreakers
3. **Rule merging** — iterates ordered packs, merges `fixed_rules` + `configurable_rules`
4. **Conflict resolution** — when a rule_id already exists, applies namespace-specific or default strategy:
   - `stricter_wins`: fixed beats configurable; ties go to later pack
   - `fixed_over_configurable`: fixed beats configurable; ties fall through to `last_write_wins`
   - `last_write_wins` (default): later pack always wins
5. **Namespace derivation** — `SEC-`→security, `QA-`→quality, `ENG-`→stack, `OPS-`→operations, `API-`→interface, else→general
6. **Snapshot assembly** — deterministic ID from `shortHash(canonicalJsonString({runId, rules}), 12)`

### Exported Types

- `ResolverContext` — `{ routing, gates, compliance_flags, delivery }`
- `SelectedPack` — `{ pack_id, pack_version, category, applies_when, specificity_score, priority }`
- `ResolvedRule` — `{ rule_id, category, name, description, rule_type, value, fixed, sources, resolved_by }`
- `ConflictEntry` — `{ rule_id, packs, values, resolution }`
- `ResolverOutput` — `{ resolver_context, selected_packs, resolved_rules, overrides_applied, overrides_blocked, conflict_log }`
- `OverrideRecord` — `{ override_id, rule_id, before, after, source, reason?, status, timestamp }`
- `ResolvedStandard` — `{ standard_id, title, namespace, source_pack, version, content }`
- `ResolverTraceEntry` — `{ pack_id, version, rule_id, merged_at, namespace }`
- `FixedVsConfigurable` — `{ [rule_id]: "fixed" | "configurable" }`
- `ResolvedStandardsSnapshot` — Full snapshot type (see 01_contract.md §3)

## 4. Module: `src/core/standards/snapshot.ts`

### `writeSnapshot(runDir: string, snapshot: ResolvedStandardsSnapshot): void`

Writes the snapshot as canonical JSON to `{runDir}/standards/resolved_standards_snapshot.json`.

### `loadSnapshot(runDir: string): ResolvedStandardsSnapshot`

Reads and parses the snapshot from the run directory. Throws if the file does not exist.

### Re-exports

- `ResolvedStandardsSnapshot` (re-exported from `resolver.ts`)

## 5. Module: `src/core/standards/selector.ts` (Stubs)

### `loadPackIndex(_indexPath: string): PackIndex` — throws `NotImplementedError`

### `matchPacks(_index: PackIndex, _context: ResolverContext): SelectedPack[]` — throws `NotImplementedError`

### `computeSpecificityScore(_appliesWhen: Record<string, unknown>): number` — throws `NotImplementedError`

These functions are not used by the active pipeline; pack selection is handled by `applicability.ts` and `resolver.ts`.

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
