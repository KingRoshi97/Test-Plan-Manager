# Run Sequences

> Explicit run sequences for common Roshi scenarios.

**Version:** 2.1  
**Last Updated:** UNKNOWN

---

## Overview

Roshi provides four primary run sequences depending on your starting point and goals. Each sequence is designed to be run in order, with verification gates ensuring quality.

---

## Sequence 1: New Build Bootstrap

**Use when:** Starting a new project from scratch with no existing codebase.

```bash
# 1. Initialize workspace structure
npm run roshi:init

# 2. Generate source documents (AI-powered)
npm run roshi:gen

# 3. Seed domain packs from templates
npm run roshi:seed

# 4. Draft domain documentation
npm run roshi:draft

# 5. Review generated content
npm run roshi:review

# 6. Verify all gates pass
npm run roshi:verify

# 7. Lock workspace (only after verify passes)
npm run roshi:lock

# 8. Package for handoff
npm run roshi:package
```

**Expected Duration:** 30-60 minutes  
**Key Gates:** Sources exist, templates valid, domains registered

---

## Sequence 2: Existing Repo Rebuild (No Wipe)

**Use when:** Regenerating documentation for an existing project without touching code.

```bash
# 1. Consolidate scattered docs into evidence library
npm run roshi:consolidate

# 2. Reset workspace (archives existing, regenerates from Project Overview)
npm run roshi:reset

# 3. Generate fresh source documents
npm run roshi:gen

# 4. Seed and draft domains
npm run roshi:seed
npm run roshi:draft

# 5. Review and verify
npm run roshi:review
npm run roshi:verify

# 6. Lock and package
npm run roshi:lock
npm run roshi:package
```

**Expected Duration:** 45-90 minutes  
**Key Gates:** Consolidation complete, Project Overview valid, domains extracted

---

## Sequence 3: Existing Repo Rebuild (Wipe Frontend)

**Use when:** Full rebuild including archiving legacy frontend code.

```bash
# 1. Clean up root clutter first
npm run roshi:reorg

# 2. Consolidate documentation
npm run roshi:consolidate

# 3. Reset with frontend wipe (preserves theme/brand/assets)
npm run roshi:reset -- --wipe-frontend

# 4. Full documentation regeneration
npm run roshi:gen
npm run roshi:seed
npm run roshi:draft

# 5. Review and verify
npm run roshi:review
npm run roshi:verify

# 6. Lock and package
npm run roshi:lock
npm run roshi:package

# 7. Optional: Purge archives after verification
npm run roshi:purge -- --dry-run  # Preview first
npm run roshi:purge               # Execute if satisfied
```

**Expected Duration:** 60-120 minutes  
**Key Gates:** Protected paths enforced, brand assets preserved, verification passes

---

## Sequence 4: Docs-Only Refresh

**Use when:** Updating documentation without affecting code or workspace structure.

```bash
# 1. Generate updated source documents
npm run roshi:gen

# 2. Optionally regenerate specific domain
npm run roshi:gen -- --domain <slug>

# 3. Update drafts
npm run roshi:draft

# 4. Review changes
npm run roshi:review

# 5. Verify gates
npm run roshi:verify
```

**Expected Duration:** 15-30 minutes  
**Key Gates:** Sources valid, templates intact

---

## Common Flags

| Flag | Command | Description |
|------|---------|-------------|
| `--dry-run` | reorg, consolidate, reset, purge | Preview changes without writing |
| `--domain <slug>` | gen, seed, draft | Limit to single domain |
| `--wipe-frontend` | reset | Archive legacy frontend |
| `--force` | purge | Override consolidation check |
| `--verbose` | all | Show detailed output |

---

## Verification Gates Summary

| Gate | Description | Required For |
|------|-------------|--------------|
| Inputs | Required paths exist | All sequences |
| Sources | Project Overview first | All sequences |
| Templates | Template folder complete | gen, seed |
| Domain Registry | domains.json valid | seed, draft |
| Terminology | terminology.md with required headings | verify |
| Build Order | Covers all domains, no cycles | verify |
| No-Overwrite | Regen didn't overwrite authored content | verify |
| Lock | Lock artifacts created after verify | package |

---

## Troubleshooting

### "Protected path violation"

A hygiene command tried to touch a protected file. Check `roshi/protected-paths.json` and ensure you're not trying to move/delete critical files.

### "Domain list not found"

Project Overview doesn't have a recognizable domains section. Add a `## Domains` heading with bullet points.

### "Consolidation not complete"

Run `npm run roshi:consolidate` before attempting to purge.

### "Verify failed"

Check the specific gate that failed. Common issues:
- Missing terminology.md headings
- Build order doesn't cover all domains
- Prerequisites reference invalid domains
