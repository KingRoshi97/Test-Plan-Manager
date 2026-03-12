# Standards Resolution Policy

## Purpose

Defines the resolution process for combining multiple standards packs into a single snapshot.

## Resolution Order

1. CORE pack is always resolved first (highest priority)
2. Conditional packs are resolved in priority order (highest to lowest)
3. When two packs define the same rule_id, the higher-priority pack wins
4. Fixed rules cannot be overridden by lower-priority packs
5. Configurable rules use last-writer-wins within priority bands

## Conflict Resolution

- Conflicts are detected when multiple packs define contradictory fixed rules
- Conflicts must be logged in the standards decision report
- Unresolvable conflicts block pipeline progression and require manual review

## Snapshot Format

The resolved snapshot must include:
- All applicable fixed rules with source_pack attribution
- All applicable configurable rules with final values and override chain
- Resolution metadata (packs_resolved, conflicts_detected, resolution_timestamp)
