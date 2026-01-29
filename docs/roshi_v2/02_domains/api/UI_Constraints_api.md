# UI Constraints — API

## Overview
**Domain Slug:** api

## Note
The API domain does not have a UI - it exposes HTTP endpoints. This document describes API response formatting constraints.

## Response Format Constraints
- All responses are JSON
- Error responses include { error: string, code: string }
- Success responses include relevant data payload
- HTTP status codes follow REST conventions

## Request Constraints
- Content-Type: application/json for POST/PUT
- Accept: application/json for all requests
- Accept: application/zip for download endpoint

## Error Response Format

| Field | Type | Description |
|-------|------|-------------|
| error | string | Human-readable error message |
| code | string | Machine-readable error code |
| details | object | Optional additional details |

## Performance Constraints
- Response time < 100ms for status checks
- Pipeline execution may take 5-30 seconds (async)
- Download endpoint streams file, no size limit for MVP

## Open Questions
- None - API constraints are defined for MVP
