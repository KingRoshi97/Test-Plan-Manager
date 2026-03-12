# Access Policy — Templates Library

## Purpose

Defines access rules for templates, including external agent restrictions and kit export filtering.

## Access Rules

### Internal Agents

- All templates are accessible to internal agents
- Internal agents may select, render, and validate any active template

### External Agents

- External agents may access templates with `executor_access: internal_and_external` (default for all published templates)
- Templates marked `executor_access: internal_only` must be excluded from external kit exports
- External kits must include selected templates but may redact internal-only content

### Kit Export Rules

- Kit exports for external execution must filter templates by executor_access
- Export report must list rendered templates and any excluded items with reason codes
- Bundle selection must use executor-appropriate bundles

## Enforcement

Access filtering is applied during template selection (TMP-3) and render envelope generation (TMP-4).
