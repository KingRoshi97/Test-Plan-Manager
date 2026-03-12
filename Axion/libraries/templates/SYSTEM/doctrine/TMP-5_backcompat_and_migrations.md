---
library: templates
id: TMP-5-GOV
section: backcompat_and_migrations
schema_version: 1.0.0
status: draft
---

# TMP-5 — Backward Compatibility & Migrations

## Overview
This document defines the backward compatibility tiers for template revisions and the
migration rules that govern how template changes propagate through the system. Template
changes must be classified, and breaking changes must follow explicit migration paths.

## Backward Compatibility Tiers

| Tier | Label | Description | Version Impact |
|---|---|---|---|
| BC-0 | Fully compatible | No observable change to rendered output for existing inputs | Patch bump |
| BC-1 | Additive | New sections or optional placeholders added; existing output unchanged | Minor bump |
| BC-2 | Behavioral | Existing placeholder resolution logic changes; output may differ | Minor bump with migration note |
| BC-3 | Breaking | Required placeholders added/removed, sections restructured, output schema changes | Major bump with migration plan |
| BC-4 | Replacement | Template is superseded by a new template with a different ID | Deprecation + new template registration |

## Migration Rules

### BC-0 and BC-1 Changes
- No migration required
- Registry updated in place with new version
- Existing pipeline configurations continue to work without modification

### BC-2 Changes
- Migration note required in the registry entry
- Affected pipelines should be tested with the new version before promotion
- A 30-day overlap period where both old and new behavior are available via version pinning

### BC-3 Changes
- Written migration plan required before the change is registered
- Migration plan must include: affected templates, changed placeholders/sections, required input changes, rollback procedure
- A deprecation notice is added to the old version
- Minimum 60-day overlap period for `high` and `critical` risk class consumers

### BC-4 Changes (Replacement)
- Old template is moved to `deprecated` status
- New template is registered with a fresh ID
- A `superseded_by` field is added to the old template's registry entry
- A `supersedes` field is added to the new template's registry entry
- Overlap period is governed by the highest risk class consuming the old template

## Deprecation Policy

| Phase | Duration | Behavior |
|---|---|---|
| Active + Deprecated | Overlap period | Both old and new versions selectable; old emits deprecation warning |
| Deprecated only | Post-overlap | Old version still selectable but emits strong warning; new version is default |
| Archived | Post-archival | Old version no longer selectable; retained for audit trail only |

## Migration Plan Template

A migration plan must contain:

1. **Change summary** — what changed and why
2. **Affected templates** — list of template_ids and versions affected
3. **Input changes** — new/removed/modified required inputs
4. **Output changes** — differences in rendered output structure
5. **Rollback procedure** — how to revert to the previous version
6. **Timeline** — proposed dates for deprecation, overlap, and archival
7. **Risk assessment** — impact on active pipeline configurations

## Version Pinning

- Pipeline configurations may pin to a specific template version
- Pinned versions are honored even after the template is deprecated (but not archived)
- Pinning to an archived version is an error that blocks pipeline execution
- Version pins are recorded in the run manifest for traceability

## Relationship to Other Sections

- **TMP-1 (Registry Rules)**: Version bumps and status changes follow registry rules
- **TMP-4 (Completeness & Proofs)**: New versions must maintain or improve completeness guarantees
- **TMP-6 (Template Health)**: Deprecated templates with active consumers are flagged as health issues
- **TMP-2 (Applicability & Selection)**: Selection respects version pins and deprecation status
