# Screen Map — Infrastructure

## Overview
**Domain Slug:** infra

## Note
The Infrastructure domain does not have screens - it provides backend file system and storage capabilities. See DDES_infra.md for entity specifications.

## Services Provided

### Service: FileSystem
- **Purpose:** Read and write files to local filesystem
- **Operations:** read, write, exists, mkdir, list
- **Used By:** All pipeline scripts, package command

### Service: ZipBuilder
- **Purpose:** Create zip archives for bundle packaging
- **Operations:** addFile, finalize, getStream
- **Used By:** assembler:package command

### Service: StorageAdapter
- **Purpose:** Abstract storage backend for future S3 migration
- **Operations:** put, get, delete, list
- **Used By:** Bundle storage, artifact persistence

## Open Questions
- None - infrastructure services are well-defined
