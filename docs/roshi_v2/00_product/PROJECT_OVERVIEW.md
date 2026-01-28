# Project Overview — Roshi Studio

## Goal
Build "Roshi Studio": a web app + API that runs the Roshi pipeline using an NPM package.
User pastes an idea + minimal context, clicks Generate, and receives a downloadable "Agent Handoff Bundle" (zip) containing Roshi docs + manifests + exports that can be uploaded to a vibecoding agent.

## Product Shape
- NPM engine: @roshi/core (pure logic)
- API service: runs @roshi/core, produces runs + artifacts + bundle zip
- Web app: UI to create runs, view status, download zip, copy agent prompt

## Platforms
- Web (React/Next.js or similar)
- API (Node/Express)
- Storage (local filesystem for this test; later S3-compatible)

## Key Flows
1. Create Run: submit idea + preset -> returns runId
2. Pipeline: init/gen/seed/draft/review/verify/lock (docs-first)
3. Package: create bundle zip containing workspace + handoff manifest + agent prompt + exports
4. Download: user downloads bundle zip
5. Agent Execution: user uploads zip to vibecoding agent, runs commands in manifest

## Core Objects (canonical)
- User
- Project
- Run (pipeline run)
- DomainPack (generated docs per domain)
- Artifact (files created/modified)
- VerifyResult (gates + failures)
- ERC (execution readiness contract)
- Bundle (zip handoff)
- TemplatePack (versioned templates)
- SourceRef (citations / known inputs)

## Constraints (discipline)
- No invention: missing info must become UNKNOWN + logged to Open Questions
- No overwrite: scripts skip if file exists unless explicitly allowed by spec
- Verify before lock
- Always print ROSHI_REPORT after every script run

## Source
Extracted from: docs/inputs/TARGET_OUTLINE.md

## Open Questions
- Specific authentication mechanism: UNKNOWN
- Production storage backend details: UNKNOWN
- Template versioning strategy: UNKNOWN
