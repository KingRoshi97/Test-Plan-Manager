# Domain Map

## Overview
This document maps all domains in the system and their responsibilities.

## Domains

| Domain | Slug | Prefix | Type | Description |
|--------|------|--------|------|-------------|
| Platform | platform | platform | business | Core platform services |
| API | api | api | business | API service layer |
| Web | web | web | business | Web frontend |
| Infrastructure | infra | infra | crosscutting | Infrastructure concerns |
| Security | security | security | crosscutting | Security concerns |

## Domain Boundaries

### Platform
- **Owns:** User, Project, TemplatePack, SourceRef
- **Responsibilities:** User management, project management, template versioning

### API
- **Owns:** Run, DomainPack, Artifact, VerifyResult, ERC, Bundle
- **Responsibilities:** Pipeline execution, artifact generation, verification

### Web
- **Owns:** UI components, views
- **Responsibilities:** User interface, user experience

### Infrastructure
- **Owns:** Storage, deployment
- **Responsibilities:** File storage, deployment infrastructure

### Security
- **Owns:** Authentication, authorization
- **Responsibilities:** Access control, security policies

## Open Questions
- UNKNOWN
