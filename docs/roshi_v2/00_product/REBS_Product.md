# Requirements & Entity Baseline Specification (REBS)

## Overview
This document defines the entities and their relationships for the product.

## Core Entities
Based on TARGET_OUTLINE.md:
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

## Entity Definitions

| Entity | Description | Owner Domain | Key Fields |
|--------|-------------|--------------|------------|
| User | System user | platform | id, name, email |
| Project | User project | platform | id, name, userId |
| Run | Pipeline execution | api | id, projectId, status, createdAt |
| DomainPack | Generated docs per domain | api | id, runId, domainSlug |
| Artifact | Files created/modified | api | id, runId, path, type |
| VerifyResult | Verification gates + failures | api | id, runId, passed, failures |
| ERC | Execution readiness contract | api | id, domainSlug, version, locked |
| Bundle | Zip handoff package | api | id, runId, path, createdAt |
| TemplatePack | Versioned templates | platform | id, version, templates |
| SourceRef | Citations / known inputs | platform | id, source, path |

## Entity Relationships
<!-- Define relationships between entities -->
- User has many Projects
- Project has many Runs
- Run has many DomainPacks, Artifacts, VerifyResults
- Run produces one Bundle

## Open Questions
- UNKNOWN
