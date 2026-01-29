# Domain Design & Entity Specification (DDES) — Infrastructure

## Overview
**Domain Slug:** infra
**Domain Prefix:** infra
**Domain Type:** crosscutting

## Purpose
The Infrastructure domain handles file system operations, storage, and zip file creation. It provides the underlying I/O capabilities that other domains depend on.

## Entities

| Entity | Description | Owner |
|--------|-------------|-------|
| FileSystem | Abstraction for reading/writing files | infra |
| ZipBuilder | Creates zip archives for bundles | infra |
| StorageAdapter | Interface for storage backends (local, S3-compatible) | infra |

## Key Responsibilities
- Read and write files to the file system
- Create directory structures
- Build zip archives for bundles
- Provide storage abstraction for future S3 migration
- Handle file path resolution and validation

## Domain Boundaries
- **In Scope:** File I/O, directory creation, zip building, storage abstraction
- **Out of Scope:** Business logic (platform domain), API routing (api domain), UI (web domain)

## Dependencies
- None - infrastructure is a foundation domain

## Open Questions
- None - using local filesystem for MVP per PROJECT_OVERVIEW
