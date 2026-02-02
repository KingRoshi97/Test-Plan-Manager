# UX Foundations — API

## Overview
**Domain Slug:** api

## Note
The API domain serves machine clients (Web frontend), not human users directly. This document describes the developer experience for API consumers.

## Consumer Types

| Consumer Type | Description | Primary Goals |
|---------------|-------------|---------------|
| Web Frontend | React application | Create runs, get status, download bundles |
| CLI (future) | Command-line tool | Automate bundle generation |
| External (future) | Third-party integrations | Integrate Axiom Assembler into workflows |

## API Design Principles
- RESTful resource-oriented design
- Consistent error handling
- Predictable response shapes
- Minimal required fields

## Request/Response Flow

### Flow: Create and Execute Run
- **Trigger:** Frontend submits idea
- **Steps:**
  1. POST /api/runs → returns { id, status: "created" }
  2. POST /api/runs/:id/execute → returns { status: "running" }
  3. Poll GET /api/runs/:id until status is "completed"
  4. GET /api/runs/:id/download → returns zip file
- **Outcome:** Client has bundle zip

## Developer Experience
- Clear error messages with actionable guidance
- Consistent field naming across endpoints
- Status codes that match HTTP semantics
- No authentication required for MVP

## Open Questions
- None - API DX is defined for MVP
