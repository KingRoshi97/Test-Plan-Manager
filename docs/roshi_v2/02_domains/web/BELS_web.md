# Business Entity Logic Specification (BELS) — Web

## Overview
**Domain Slug:** web
**Domain Prefix:** web
**Status:** DRAFT - Truth Candidates

## Policy Rules (Candidates)
<!-- Business rules that govern this domain -->
<!-- SourceRef: REBS_Product > Core Entities -->

| Rule ID | Description | Condition | Action | SourceRef |
|---------|-------------|-----------|--------|-----------|
| web_001 | Idea required for generation | User clicks Generate | Validate idea field not empty | PROJECT_OVERVIEW > Key Flows |
| web_002 | Show progress during pipeline | Pipeline is running | Display current step and progress | PROJECT_OVERVIEW > Key Flows |
| web_003 | Enable download when ready | Bundle exists and run completed | Show download button | PROJECT_OVERVIEW > Key Flows |
| web_004 | Copy prompt available | Bundle exists | Show copy prompt button | PROJECT_OVERVIEW > Key Flows |

## State Machines (Candidates)
<!-- State transitions for entities -->
### Entity: GeneratorForm
| Current State | Event | Next State | Deny Code | SourceRef |
|---------------|-------|------------|-----------|-----------|
| idle | submit | validating | - | PROJECT_OVERVIEW > Key Flows |
| validating | valid | running | - | PROJECT_OVERVIEW > Key Flows |
| validating | invalid | idle | WEB_FORM_001 | PROJECT_OVERVIEW > Constraints |
| running | step_complete | running | - | PROJECT_OVERVIEW > Key Flows |
| running | complete | ready | - | PROJECT_OVERVIEW > Key Flows |
| running | error | failed | WEB_RUN_001 | PROJECT_OVERVIEW > Constraints |
| ready | download | ready | - | PROJECT_OVERVIEW > Key Flows |
| failed | retry | idle | - | PROJECT_OVERVIEW > Key Flows |

## Validation Rules (Candidates)
<!-- Data validation rules -->

| Field | Rule | Error Code | SourceRef |
|-------|------|------------|-----------|
| idea | Required, min 10 chars | WEB_FORM_001 | PROJECT_OVERVIEW > Key Flows |
| context | Optional, max 5000 chars | WEB_FORM_002 | PROJECT_OVERVIEW > Key Flows |

## Reason Codes Referenced
<!-- Referenced from reason-codes.md -->

| Code | Message | Severity |
|------|---------|----------|
| WEB_FORM_001 | Idea is required (min 10 characters) | ERROR |
| WEB_FORM_002 | Context exceeds maximum length | WARNING |
| WEB_RUN_001 | Pipeline execution failed | ERROR |

## Open Questions
<!-- Questions generated during draft -->
- None - web domain is well-specified for MVP
