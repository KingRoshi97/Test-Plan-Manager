# Template Use Policy

## Purpose

Defines how templates may be used by agents during specification creation, planning, and kit generation. Adapted from the knowledge library's use policy for the templates context.

## Use Policy Tiers

### standard_fill (default)

- Agent selects templates via deterministic selection rules
- Agent fills placeholders using canonical spec, standards snapshot, and knowledge items
- All template fills must produce a valid render envelope (TMP-4)
- Template IDs and versions must be cited in output metadata

### restricted_internal_only

- Templates marked restricted are available only to internal agents
- External executors cannot access restricted templates
- Kit exports for external execution must exclude restricted templates

## Allowed Behaviors

Agents MAY:
1. Select templates according to applicability rules and selection model (TMP-2, TMP-3)
2. Fill placeholders with derived content from canonical spec, standards, and knowledge
3. Combine multiple templates for a single feature area
4. Skip optional templates when applicability conditions are not met
5. Record template selection justifications in the decision report

## Restricted Behaviors

Agents MUST NOT:
1. Modify template structure or required sections during fill
2. Skip required templates without documenting justification
3. Use templates outside their declared applicability scope
4. Fill placeholders with content that contradicts the standards snapshot
5. Bypass the selection model — only templates present in TEMPLATE_SELECTION may be filled
