# Domain Design & Entity Specification (DDES) — API

## Overview
**Domain Slug:** api
**Domain Prefix:** api
**Domain Type:** business

## Purpose
The API domain exposes HTTP endpoints that allow clients to create runs, execute the pipeline, check status, and download bundles. It orchestrates calls to the Roshi scripts and manages run lifecycle.

## Entities

| Entity | Description | Owner |
|--------|-------------|-------|
| RunEndpoint | POST /api/runs - creates a new run | api |
| ExecuteEndpoint | POST /api/runs/:id/execute - triggers pipeline | api |
| StatusEndpoint | GET /api/runs/:id - returns run status | api |
| DownloadEndpoint | GET /api/runs/:id/download - serves bundle zip | api |

## Key Responsibilities
- Validate incoming API requests
- Create and manage Run records
- Execute pipeline scripts in sequence (gen, seed, draft, package)
- Return run status with step progress
- Serve bundle zip files for download

## Domain Boundaries
- **In Scope:** HTTP endpoints, request validation, pipeline orchestration, response formatting
- **Out of Scope:** UI rendering (web domain), file storage details (infra domain), user auth (security domain)

## Dependencies
- Platform domain: Run entity definitions
- Infra domain: file system access for bundle storage

## Open Questions
- None - API surface is well-defined for MVP
