# Domain Interface Map (DIM) — Infrastructure

## Overview
**Domain Slug:** infra

## Exposed Interfaces
<!-- APIs/interfaces this domain exposes -->

| Interface | Type | Description | Consumers |
|-----------|------|-------------|-----------|
| FileSystem.read | Function | Read file contents | api, scripts |
| FileSystem.write | Function | Write file contents | api, scripts |
| FileSystem.exists | Function | Check file existence | api, scripts |
| FileSystem.mkdir | Function | Create directories | api, scripts |
| ZipBuilder.create | Function | Create zip archive | api (package) |
| ZipBuilder.addFile | Function | Add file to zip | api (package) |
| ZipBuilder.finalize | Function | Complete zip creation | api (package) |

## Consumed Interfaces
<!-- Interfaces this domain consumes from others -->

| Interface | Provider Domain | Description |
|-----------|-----------------|-------------|
| N/A | N/A | Infra is foundation, consumes nothing |

## Events Published
<!-- Events this domain publishes -->

| Event Name | Payload | Subscribers |
|------------|---------|-------------|
| N/A | N/A | No events for MVP |

## Events Subscribed
<!-- Events this domain listens to -->

| Event Name | Publisher Domain | Handler |
|------------|------------------|---------|
| N/A | N/A | No event subscriptions for MVP |

## Open Questions
- None - infra interfaces are well-defined
