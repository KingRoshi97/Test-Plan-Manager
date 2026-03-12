# Template Versioning Policy

## Purpose

Defines how template versions are managed, including version bumps, backward compatibility, and migration rules.

## Version Scheme

Templates use semantic versioning: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes to template structure, required sections, or placeholder contract
- **MINOR**: New optional sections, new optional placeholders, enriched guidance
- **PATCH**: Typo fixes, wording improvements, no structural change

## Backward Compatibility

- Templates with backcompat_tier "stable" must not have breaking changes without a deprecation period
- Deprecated templates must have a replacement mapping in the deprecations registry
- Migration guides must be provided for MAJOR version bumps

## Pin Policy

- Run manifests must pin template registry version
- Template selection results must record the exact template version used
