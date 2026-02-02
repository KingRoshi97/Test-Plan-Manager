# UX Foundations — Infrastructure

## Overview
**Domain Slug:** infra

## Note
The Infrastructure domain serves as a foundation layer and does not directly interact with users. This document describes the developer experience for infra consumers.

## Consumer Types

| Consumer Type | Description | Primary Goals |
|---------------|-------------|---------------|
| API Domain | Backend service | Store and retrieve files |
| Assembler Scripts | Pipeline scripts | Read/write docs and configs |
| Package Command | Bundle creation | Create zip archives |

## Service Patterns

### File System Usage
- **Trigger:** Script or API needs file I/O
- **Steps:**
  1. Import fs utilities from infra
  2. Call read/write/exists methods
  3. Handle errors appropriately
- **Outcome:** Files read or written successfully

### Zip Creation Usage
- **Trigger:** Package command needs to create bundle
- **Steps:**
  1. Create ZipBuilder instance
  2. Add files to archive
  3. Finalize and get output path
- **Outcome:** Zip file created at specified path

## File Organization
- docs/assembler_v1: Documentation files
- dist/: Build outputs and bundles
- assembler/: Configuration files

## Error Handling
- File not found: throw with clear message
- Permission denied: throw with guidance
- Disk full: throw with space requirements

## Open Questions
- None - infra foundations are defined for MVP
