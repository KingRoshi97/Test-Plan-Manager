# FEAT-006 — Standards Resolution Engine: Observability

## 1. Key Metrics

| Metric | Source | Description |
|--------|--------|-------------|
| Packs loaded | `registryLoader.ts` | Number of packs loaded from the standards library index |
| Packs matched | `applicability.ts` | Number of packs in `matched_packs` after applicability evaluation |
| Packs unmatched | `applicability.ts` | Number of packs in `unmatched_packs` |
| Rules resolved | `resolver.ts` | Total rules in the final `rules` array |
| Conflicts detected | `resolver.ts` | Length of `conflict_log` in `ResolverOutput` |
| Trace entries | `resolver.ts` | Length of `resolver_trace` (one per rule per pack encounter) |

## 2. Audit Trail

The `ResolvedStandardsSnapshot` itself serves as the primary audit artifact:

- `resolver_trace[]` — Every rule merge event with `pack_id`, `version`, `rule_id`, `merged_at` timestamp, and derived `namespace`
- `conflicts[]` — Every conflict with participating `packs`, `values`, and `resolution` rationale
- `overrides_applied[]` / `overrides_blocked[]` — Override audit records with source, reason, and status
- `selected_packs[]` — Full list of packs that passed applicability with their `specificity_score` and `priority`

## 3. Logging

### 3.1 Structured Fields

- `feature`: `FEAT-006`
- `domain`: `standards`
- `run_id`: Current pipeline run identifier
- `pack_count`: Number of packs processed
- `rule_count`: Number of rules resolved
- `conflict_count`: Number of conflicts encountered

### 3.2 Key Events

- Registry loaded (pack count, library version)
- Applicability evaluation complete (matched/unmatched counts)
- Resolution complete (rule count, conflict count, snapshot ID)
- Snapshot written (file path)

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
