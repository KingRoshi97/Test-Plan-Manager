# Screen Map — API

## Overview
**Domain Slug:** api

## Note
The API domain does not have screens - it exposes HTTP endpoints. See DDES_api.md for endpoint specifications.

## Endpoints (Not Screens)

### Endpoint: POST /api/runs
- **Purpose:** Create a new pipeline run
- **Request Body:** { idea: string, context?: string }
- **Response:** { id: string, status: "created" }

### Endpoint: POST /api/runs/:id/execute
- **Purpose:** Execute the pipeline for a run
- **Request Body:** none
- **Response:** { id: string, status: "running" | "completed" | "failed", currentStep: string }

### Endpoint: GET /api/runs/:id
- **Purpose:** Get run status
- **Response:** { id: string, status: string, currentStep: string, steps: Step[], bundlePath?: string }

### Endpoint: GET /api/runs/:id/download
- **Purpose:** Download bundle zip
- **Response:** application/zip file

## Open Questions
- None - endpoints are well-defined
