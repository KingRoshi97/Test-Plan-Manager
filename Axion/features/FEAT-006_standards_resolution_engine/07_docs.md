# FEAT-006 — Standards Resolution Engine: Documentation Requirements

## 1. System Documentation References

| Document | Relevance |
|----------|-----------|
| STD-01 (Standards Library Structure) | Defines the on-disk layout of `libraries/standards/` — index, packs, resolver rules |
| STD-02 (Standards Resolution Rules) | Defines the resolution algorithm contract: selection, ordering, conflicts, overrides, output |
| STD-03 (Standards Snapshot Format) | Defines the schema for `resolved_standards_snapshot.json` |
| SYS-03 (End-to-End Architecture) | Places standards resolution in the pipeline between intake normalization and template selection |
| SYS-07 (Compliance & Gate Model) | Defines GATE-03 which validates the snapshot |

## 2. Data Flow

```
loadStandardsRegistry(repoRoot)
  → { index, packs, resolverRules }

evaluateApplicability(routing, constraints, packs, resolverRules, runId, evaluatedAt)
  → { matched_packs, unmatched_packs }

resolveStandards(normalizedInput, registry, matchedPacks, runId)
  → { snapshot, resolverOutput }

writeSnapshot(runDir, snapshot)
  → writes resolved_standards_snapshot.json
```

## 3. Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `standards_index.json` | `libraries/standards/` | Pack registry with categories and file paths |
| `resolver_rules.v1.json` | `libraries/standards/` | Selection, ordering, conflict, override, and output rules |
| Pack files (`*.json`) | `libraries/standards/packs/` | Individual standards packs with fixed and configurable rules |

## 4. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
