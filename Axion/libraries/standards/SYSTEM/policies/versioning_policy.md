# Standards Versioning Policy

## Purpose

Defines how standards pack versions are managed, including version bumps, backward compatibility, supersession, and migration rules.

## Version Scheme

Standards packs use semantic versioning: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes to fixed rules, scope changes, or rule removal
- **MINOR**: New configurable rules, expanded applicability, enriched guidance
- **PATCH**: Wording fixes, description improvements, no rule changes

## Supersession

- When a pack is superseded, the new pack must reference the old pack via supersedes field
- Deprecated packs must have a replacement mapping in the deprecations registry
- Active runs using deprecated packs must be notified of available upgrades

## Pin Policy

- Run manifests must pin standards index version
- Standards snapshots must record the exact pack versions resolved
- Snapshot hashes must be deterministic for reproducibility
