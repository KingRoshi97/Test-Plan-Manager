# Domain Interface Map (DIM) — API

## Overview
**Domain Slug:** api

## Exposed Interfaces
<!-- APIs/interfaces this domain exposes -->

| Interface | Type | Description | Consumers |
|-----------|------|-------------|-----------|
| POST /api/runs | REST | Create a new pipeline run | Web domain |
| POST /api/runs/:id/execute | REST | Execute the pipeline | Web domain |
| GET /api/runs/:id | REST | Get run status | Web domain |
| GET /api/runs/:id/download | REST | Download bundle zip | Web domain |

## Consumed Interfaces
<!-- Interfaces this domain consumes from others -->

| Interface | Provider Domain | Description |
|-----------|-----------------|-------------|
| FileSystem.write | infra | Write files during pipeline |
| FileSystem.read | infra | Read files for bundling |
| ZipBuilder | infra | Create bundle zip |
| Run entity | platform | Run data model |

## Events Published
<!-- Events this domain publishes -->

| Event Name | Payload | Subscribers |
|------------|---------|-------------|
| run.created | { runId, idea } | None (MVP) |
| run.completed | { runId, bundlePath } | None (MVP) |
| run.failed | { runId, error } | None (MVP) |

## Events Subscribed
<!-- Events this domain listens to -->

| Event Name | Publisher Domain | Handler |
|------------|------------------|---------|
| N/A | N/A | No event subscriptions for MVP |

## Open Questions
- None - API interfaces are well-defined
