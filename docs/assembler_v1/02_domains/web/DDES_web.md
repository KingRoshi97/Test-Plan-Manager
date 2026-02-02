# Domain Design & Entity Specification (DDES) — Web

## Overview
**Domain Slug:** web
**Domain Prefix:** web
**Domain Type:** ui

## Purpose
The Web domain provides the user interface for Axiom Assembler. Users interact with this domain to submit ideas, monitor pipeline progress, and download generated bundles.

## Entities

| Entity | Description | Owner |
|--------|-------------|-------|
| IdeaForm | Form state for idea submission | web |
| RunStatusView | Display model for pipeline progress | web |
| DownloadAction | Action trigger for bundle download | web |

## Key Responsibilities
- Render idea submission form
- Display real-time pipeline progress
- Provide bundle download functionality
- Show agent prompt for copying
- Handle form validation and error display

## Domain Boundaries
- **In Scope:** UI components, form validation, status display, download triggers
- **Out of Scope:** Pipeline execution (API domain), storage (infra domain), authentication (security domain)

## Dependencies
- API domain: for run creation and status polling
- Platform domain: for Run entity state

## Open Questions
- None - boundaries are clear for MVP
