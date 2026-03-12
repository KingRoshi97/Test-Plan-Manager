# Standards Use Policy

## Purpose

Defines how standards packs and standard units may be used by agents during specification creation, planning, and verification. Adapted from the knowledge library's use policy for the standards context.

## Use Policy Tiers

### mandatory (default for CORE pack)

- Standards in the CORE pack apply to all runs regardless of profile or risk class
- Agents must resolve and apply all mandatory standards before downstream stages
- Violations of mandatory standards block pipeline progression

### conditional

- Standards apply only when their applicability conditions match the run context
- Applicability is determined by profile, risk class, stack, and domain
- Conditional standards that match must be included in the resolved snapshot

### advisory

- Advisory standards provide guidance but do not block pipeline progression
- Agents should note advisory standards in the decision report
- Advisory standards may be promoted to conditional or mandatory via governance

## Allowed Behaviors

Agents MAY:
1. Resolve standards according to the deterministic resolver order (STD-3)
2. Apply conflict resolution rules when packs overlap (STD-3)
3. Record resolution decisions in the standards decision report
4. Skip conditional standards when applicability conditions are not met
5. Override configurable rules when a stricter pack takes precedence

## Restricted Behaviors

Agents MUST NOT:
1. Skip mandatory (CORE) standards without explicit override authorization
2. Modify fixed rules during resolution
3. Apply standards outside their declared applicability scope
4. Resolve standards in a non-deterministic order
5. Bypass the resolver — only standards present in the resolved snapshot may influence outputs
