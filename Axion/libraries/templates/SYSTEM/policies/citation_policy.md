# Citation Policy — Templates Library

## Purpose

Defines mandatory citation behavior when agents use templates during selection, rendering, and gate evaluation.

## Rules

### When Citation is Required

Any time a template influences an output, the agent MUST emit template_citations. This includes:

- When a template is selected for rendering via TMP-3 selection
- When a template's structure or placeholders shape the output artifact
- When a template's acceptance criteria are used for validation
- When template metadata influences selection or ordering decisions

### Citation Format

Agents must emit citations in the render envelope or run log:

```json
{
  "template_citations": [
    {
      "template_id": "ABT-01",
      "version": "1.0.0",
      "usage": "template_rendered",
      "sections_used": ["Template Body", "Acceptance Criteria"]
    }
  ]
}
```

### Prohibitions

- Citations MUST NOT reference deprecated templates unless explicitly allowed
- Citations MUST reference templates present in the template registry

## Enforcement

Template gate evaluation (TMP-6) verifies citation completeness as part of the evidence requirements.
