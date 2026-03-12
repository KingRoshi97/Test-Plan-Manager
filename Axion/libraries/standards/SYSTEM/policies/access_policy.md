# Access Policy — Standards Library

## Purpose

Defines access rules for standard units and packs, including external agent restrictions and kit export filtering.

## Access Rules

### Internal Agents

- All standard units and packs are accessible to internal agents
- Internal agents may resolve, snapshot, and apply any active standard

### External Agents

- External agents may access standards with `executor_access: internal_and_external` (default for all published standards)
- Standards marked `executor_access: internal_only` must be excluded from external kit exports
- External kits must include the resolved snapshot but may redact internal-only standards

### Kit Export Rules

- Kit exports for external execution must filter standards by executor_access
- Export report must list applied standards and any excluded items with reason codes
- Bundle selection must use executor-appropriate bundles

## Enforcement

Access filtering is applied during standards resolution (STD-3) and snapshot generation (STD-4).
