# UI Constraints — Infrastructure

## Overview
**Domain Slug:** infra

## Note
The Infrastructure domain does not have a UI - it provides file system and storage services. This document describes I/O constraints.

## File System Constraints
- Use Node.js fs module for file operations
- All paths relative to project root
- No path traversal outside workspace allowed
- Create parent directories automatically

## Storage Constraints

| Constraint | Value | Notes |
|------------|-------|-------|
| Max file size | No limit for MVP | Future: may add limits |
| Allowed extensions | All | No restrictions for MVP |
| No-overwrite default | Yes | Skip existing files unless --force |

## Zip Constraints
- Use archiver library for zip creation
- Compression level: 9 (maximum)
- Max zip size: No limit for MVP
- File paths within zip: relative to bundle root

## Performance Constraints
- Streaming for large files (future)
- Async operations preferred
- No blocking I/O in request handlers

## Open Questions
- None - infra constraints are defined for MVP
