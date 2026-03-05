# FEAT-006 — Standards Resolution Engine: Contract

## 1. Purpose

Loads standards packs from the library, evaluates their applicability against normalized intake input, resolves conflicts using configurable precedence strategies, and produces a version-pinned, deterministic standards snapshot written to the run directory.

## 2. Inputs

- `repoRoot: string` — Repository root path used to locate `libraries/standards/` containing `standards_index.json`, `resolver_rules.v1.json`, and individual pack JSON files
- `normalizedInput: unknown` — Normalized intake record containing `routing` (RoutingSnapshot), `constraints`, and `submission_id`
- `matchedPacks: ApplicabilityMatch[]` — Output from applicability evaluation identifying which packs matched the run context
- `runId: string` — Current pipeline run identifier
- `runDir: string` — Run output directory for snapshot persistence

## 3. Outputs

- `ResolvedStandardsSnapshot` — Complete snapshot written to `{runDir}/standards/resolved_standards_snapshot.json` containing:
  - `resolved_standards_id` — Deterministic ID using `STD-SNAP-` prefix + SHA-256 short hash of run ID and resolved rules
  - `submission_id`, `created_at`, `system_version`, `schema_version_used`
  - `standards_library_version_used`, `resolver_version`
  - `resolver_context` — Derived context (routing, gates, compliance_flags, delivery)
  - `selected_packs` — Ordered list of applicable packs with specificity scores and priorities
  - `rules` — Merged, conflict-resolved rule set sorted by rule_id
  - `fixed_vs_configurable` — Map of rule_id to "fixed" | "configurable"
  - `overrides_applied`, `overrides_blocked` — Override audit records (currently empty)
  - `conflicts` — Full conflict log with resolution rationale
  - `resolved_standards` — Flattened standard entries with namespace derivation
  - `resolver_trace` — Per-rule merge trace with timestamps
- `ResolverOutput` — In-memory summary with resolver_context, selected_packs, resolved_rules, overrides, and conflict_log

## 4. Invariants

- Resolution is deterministic: identical inputs always produce the same resolved_standards_id (via canonical JSON hashing)
- Every resolved rule is version-pinned through the pack's `pack_version` field
- Conflicts are never silently ignored; every conflict is logged in the `conflicts` array with a resolution rationale string
- Fixed vs configurable flags are preserved from source packs and recorded in `fixed_vs_configurable`
- Pack ordering respects `priority_direction` (asc/desc) from resolver rules, with tiebreakers applied in order (`pack_id_asc`, `version_asc`)
- The snapshot ID is derived from a short hash (12 chars) of canonical JSON of `{ runId, rules }`, prefixed by `resolver_rules.output.snapshot_id_prefix`

## 5. Pipeline

1. **Load** — `loadStandardsRegistry(repoRoot)` reads `standards_index.json`, `resolver_rules.v1.json`, and all pack files referenced in the index
2. **Applicability** — `evaluateApplicability(routing, constraints, packs, resolverRules, runId, evaluatedAt)` computes match scores for each pack against the run context
3. **Resolve** — `resolveStandards(normalizedInput, registry, matchedPacks, runId)` orders packs, merges rules, resolves conflicts, builds snapshot
4. **Persist** — `writeSnapshot(runDir, snapshot)` writes canonical JSON to `{runDir}/standards/resolved_standards_snapshot.json`

## 6. Dependencies

- FEAT-001 (Control Plane Core) — provides run lifecycle and run ID
- FEAT-003 (Gate Engine Core) — GATE-03 validates the produced snapshot

## 7. Source Modules

- `src/core/standards/registryLoader.ts` — Pack index and rule loading
- `src/core/standards/applicability.ts` — Applicability evaluation and match scoring
- `src/core/standards/resolver.ts` — Core resolution, conflict handling, snapshot assembly
- `src/core/standards/snapshot.ts` — Snapshot read/write to filesystem
- `src/core/standards/selector.ts` — Pack selection stubs (not yet implemented)

## 8. Failure Modes

- Standards index file missing at `libraries/standards/standards_index.json` → throws `Error`
- Resolver rules file missing at `libraries/standards/resolver_rules.v1.json` → throws `Error`
- Individual pack file missing (referenced in index but absent on disk) → throws `Error` with pack_id context
- Snapshot file missing when loading via `loadSnapshot()` → throws `Error`

## 9. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- STD-01 (Standards Library Structure)
- STD-02 (Standards Resolution Rules)
- STD-03 (Standards Snapshot Format)
- GATE-03 — Standards Gate (Resolved Ruleset Integrity)
