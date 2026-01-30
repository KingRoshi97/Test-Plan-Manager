# Purge Policy

> Governs what can be permanently deleted after consolidation + verify passes.

**Generated:** UNKNOWN  
**Last Updated:** UNKNOWN

---

## Principles

1. **Archive-first** - Never delete without archiving first
2. **Verify-gated** - Purge only after `roshi:verify` passes
3. **Evidence preservation** - Keep consolidated evidence forever
4. **Engine safety** - Never purge system-critical files

---

## Allowed Purge

These targets may be purged **only after** `roshi:consolidate` and `roshi:verify` pass.

### Archive Directories

| Target | Condition | Risk Level |
|--------|-----------|------------|
| `_archive/legacy_frontend/**` | After reset with --wipe-frontend | Low |
| `_archive/legacy_misc/**` | After roshi:reorg | Low |

### Raw Assets

| Target | Condition | Risk Level |
|--------|-----------|------------|
| `attached_assets/**` | After roshi:consolidate creates docs/legacy/attached_assets.md | Medium |

---

## Never Purge

These paths are protected and must NEVER be purged.

### Database Foundation

- `server/db/schema.ts`
- `server/db/client.ts`
- `migrations/**`
- `shared/schema.ts`
- `drizzle.config.ts`

### Brand Identity

- `src/theme/**`
- `src/assets/brand/**`
- `assets/**`

### Roshi Engine

- `roshi/**`
- `scripts/**`
- `assembler/**`

### Evidence Library

- `docs/legacy/**` (unless intentionally discarding)
- `_archive/roshi_resets/**` (reset history)

---

## Purge Command

```bash
# Preview what would be deleted
npm run roshi:purge -- --dry-run

# Execute purge (requires consolidation + verify to have passed)
npm run roshi:purge
```

---

## Open Questions

- Define retention periods for archive directories
- Establish approval workflow for purge operations
- Determine backup requirements before purge
