# Domain Interface Map (DIM) — Web

## Overview
**Domain Slug:** web

## Exposed Interfaces
<!-- APIs/interfaces this domain exposes -->

| Interface | Type | Description | Consumers |
|-----------|------|-------------|-----------|
| IdeaForm | React Component | Form for submitting ideas | Home page |
| RunStatusDisplay | React Component | Shows pipeline progress | Home page |
| DownloadButton | React Component | Downloads bundle zip | Home page |
| CopyPromptButton | React Component | Copies agent prompt to clipboard | Home page |

## Consumed Interfaces
<!-- Interfaces this domain consumes from others -->

| Interface | Provider Domain | Description |
|-----------|-----------------|-------------|
| POST /api/runs | api | Create a new run |
| POST /api/runs/:id/execute | api | Execute pipeline |
| GET /api/runs/:id | api | Get run status |
| GET /api/runs/:id/download | api | Download bundle zip |

## Events Published
<!-- Events this domain publishes -->

| Event Name | Payload | Subscribers |
|------------|---------|-------------|
| formSubmit | { idea, context } | Home page handler |
| downloadClick | { runId } | Download handler |

## Events Subscribed
<!-- Events this domain listens to -->

| Event Name | Publisher Domain | Handler |
|------------|------------------|---------|
| runStatusChange | api (via polling) | RunStatusDisplay update |

## Open Questions
- None - interfaces are well-defined for MVP
