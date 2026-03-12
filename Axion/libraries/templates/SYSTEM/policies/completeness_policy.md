# Template Completeness Policy

## Purpose

Defines the completeness requirements for template fill operations and what constitutes a valid render envelope.

## Completeness Rules

1. All required placeholders must be filled
2. All required sections must be present in the render envelope
3. Optional placeholders may be left empty with justification
4. Render envelopes must pass schema validation against template_definition.v1.schema.json
5. Completeness scores must meet minimum thresholds per risk class

## Risk Class Thresholds

| Risk Class | Min Completeness | Required Sections |
|-----------|-----------------|-------------------|
| PROTOTYPE | 70% | Header, Purpose, Inputs |
| PROD | 90% | All required sections |
| COMPLIANCE | 95% | All sections including audit trail |

## Enforcement

Completeness is enforced at the template gate stage (TMP-6).
