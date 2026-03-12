# Citation Policy — Standards Library

## Purpose

Defines mandatory citation behavior when agents use standards during resolution, snapshot generation, and gate evaluation.

## Rules

### When Citation is Required

Any time a standard unit influences an output, the agent MUST emit standards_citations. This includes:

- When an agent applies a standard during specification, build, or review
- When a standard constrains architecture, design, or implementation decisions
- When a checklist or verification procedure from a standard is followed
- When default values or parameters are sourced from a standard unit

### Citation Format

Agents must emit citations in the output envelope or run log:

```json
{
  "standards_citations": [
    {
      "unit_id": "STDU-STD-ENG-001",
      "source_pack": "CORE@1.0.0",
      "usage": "constraint_applied",
      "sections_used": ["Rule"]
    }
  ]
}
```

### Prohibitions

- Citations MUST NOT reference deprecated units unless explicitly allowed by resolution policy
- Citations MUST reference units present in the resolved standards snapshot

## Enforcement

Standards gate evaluation (STD-5) verifies citation completeness as part of the evidence requirements.
